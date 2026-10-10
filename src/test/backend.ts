import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface BackendRequest {
    method: Method;
    url: string;
    body: unknown;
}

export interface BackendReply {
    status?: number;
    data?: unknown;
}

type Responder = BackendReply | ((request: BackendRequest) => BackendReply);

interface Route {
    method: Method;
    url: string | RegExp;
    responder: Responder | 'network-error';
}

const parseBody = (data: unknown): unknown => {
    if (typeof data !== 'string') {
        return data;
    }
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
};

// In-memory stand-in for the REST backend. It is installed as the axios adapter of `apiClient`
// (see setupTests.ts), so the real API and service layers run unchanged and produce real
// AxiosErrors for non-2xx replies.
//
// A request without a matching route is rejected and recorded in `unhandled`; setupTests.ts
// fails the test in that case so that missing stubs cannot go unnoticed
class FakeBackend {
    requests: BackendRequest[] = [];
    unhandled: BackendRequest[] = [];
    private routes: Route[] = [];

    // Registers a route. Routes registered later take precedence over earlier ones
    on(method: Method, url: string | RegExp, responder: Responder = {}): this {
        this.routes.unshift({ method, url, responder });
        return this;
    }

    get(url: string | RegExp, data?: unknown): this {
        return this.on('GET', url, { data });
    }

    post(url: string | RegExp, data?: unknown): this {
        return this.on('POST', url, { data });
    }

    put(url: string | RegExp, data?: unknown): this {
        return this.on('PUT', url, { data });
    }

    delete(url: string | RegExp, data?: unknown): this {
        return this.on('DELETE', url, { data });
    }

    fail(method: Method, url: string | RegExp, status: number, data?: unknown): this {
        return this.on(method, url, { status, data });
    }

    // Rejects like a request that never reached the server (AxiosError without a response)
    networkError(method: Method, url: string | RegExp): this {
        this.routes.unshift({ method, url, responder: 'network-error' });
        return this;
    }

    requestsTo(method: Method, url: string | RegExp): BackendRequest[] {
        return this.requests.filter(request => request.method === method && this.matches(url, request.url));
    }

    reset(): void {
        this.requests = [];
        this.unhandled = [];
        this.routes = [];
    }

    adapter: AxiosAdapter = (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        const request: BackendRequest = {
            method: (config.method ?? 'get').toUpperCase() as Method,
            url: config.url ?? '',
            body: parseBody(config.data),
        };
        this.requests.push(request);

        const route = this.routes.find(candidate => candidate.method === request.method && this.matches(candidate.url, request.url));
        if (!route) {
            this.unhandled.push(request);
            return Promise.reject(new AxiosError(`No fake backend route for ${request.method} ${request.url}`, AxiosError.ERR_BAD_RESPONSE, config, {}, {
                data: undefined, status: 501, statusText: 'Not Implemented', headers: {}, config,
            }));
        }
        if (route.responder === 'network-error') {
            return Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {}));
        }

        // A responder that throws must reject the request rather than throw out of the adapter
        let reply: BackendReply;
        try {
            reply = typeof route.responder === 'function' ? route.responder(request) : route.responder;
        } catch (error) {
            return Promise.reject(error);
        }

        const response: AxiosResponse = {
            data: reply.data,
            status: reply.status ?? 200,
            statusText: '',
            headers: {},
            config,
            request: {},
        };
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
        }
        return Promise.reject(new AxiosError(
            `Request failed with status code ${response.status}`,
            response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
            config,
            {},
            response
        ));
    };

    private matches(pattern: string | RegExp, url: string): boolean {
        return typeof pattern === 'string' ? pattern === url : pattern.test(url);
    }
}

export const backend = new FakeBackend();

// Stubs the read-only endpoints nearly every page calls on mount: an open tournament with a
// running group phase. Individual tests override single routes afterwards
export const stubDefaultBackend = (): void => {
    backend
        .get('/public/settings', { tournamentOpen: true, registrationOpen: true, maxGamesCount: 8, surveyKeyMode: 'DISABLED' })
        .get('/public/schedule/create/schedule', true)
        .get('/public/schedule/create/final_schedule', false)
        .get('/public/schedule/rounds/unplayed', 5)
        .get('/public/schedule/rounds/current', [])
        .get('/public/user/login/check', { user: { username: 'admin', isAdmin: true, ID: 1 } });
};

// Overrides the three schedule endpoints the pages derive their state from
export const stubScheduleState = (state: { schedule: boolean; finalSchedule: boolean; unplayed: number }): void => {
    backend
        .get('/public/schedule/create/schedule', state.schedule)
        .get('/public/schedule/create/final_schedule', state.finalSchedule)
        .get('/public/schedule/rounds/unplayed', state.unplayed);
};

// Makes the admin session check fail, as it does for a visitor who is not logged in
export const stubLoggedOutAdmin = (): void => {
    backend.fail('GET', '/public/user/login/check', 401);
};

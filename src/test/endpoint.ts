import { describe, expect, it } from 'vitest';
import { backend, Method } from './backend';

interface EndpointSpec {
    /** Invokes the API function under test. */
    call: () => Promise<unknown>;
    method: Method;
    url: string;
    /** Expected request body; omit for requests without one. */
    body?: unknown;
    /** Payload the backend answers with; the function is expected to return it unchanged. */
    response?: unknown;
    /** Set for functions that resolve to void regardless of the payload. */
    returnsVoid?: boolean;
    /** HTTP status -> German message the function must throw for it. */
    errors?: Record<number, string>;
    /** Message for every other HTTP error, including a request that got no response at all. */
    fallback: string;
}

/** A status no endpoint maps explicitly, used to exercise the fallback branch. */
const UNMAPPED_STATUS = 418;

/**
 * Generates the contract tests shared by every function in `util/api`: the request it sends,
 * the value it returns, and how it translates HTTP failures into user-facing messages.
 */
export const describeEndpoint = (name: string, spec: EndpointSpec): void => {
    describe(name, () => {
        it(`sends ${spec.method} ${spec.url}`, async () => {
            backend.on(spec.method, spec.url, { data: spec.response });

            const result = await spec.call();

            expect(backend.requests).toEqual([{ method: spec.method, url: spec.url, body: spec.body }]);
            expect(result).toEqual(spec.returnsVoid ? undefined : spec.response);
        });

        const mapped = Object.entries(spec.errors ?? {});
        if (mapped.length > 0) {
            it.each(mapped)('translates HTTP %s into "%s"', async (status, message) => {
                backend.fail(spec.method, spec.url, Number(status));

                await expect(spec.call()).rejects.toThrow(new Error(message));
            });
        }

        it(`falls back to "${spec.fallback}" for other HTTP errors`, async () => {
            backend.fail(spec.method, spec.url, UNMAPPED_STATUS);

            await expect(spec.call()).rejects.toThrow(new Error(spec.fallback));
        });

        it(`falls back to "${spec.fallback}" when the server is unreachable`, async () => {
            backend.networkError(spec.method, spec.url);

            await expect(spec.call()).rejects.toThrow(new Error(spec.fallback));
        });

        it('rethrows errors that do not come from axios', async () => {
            const failure = new Error('boom');
            backend.on(spec.method, spec.url, () => {
                throw failure;
            });

            await expect(spec.call()).rejects.toBe(failure);
        });
    });
};

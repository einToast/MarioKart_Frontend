import { vi } from 'vitest';

interface FakeClientConfig {
    webSocketFactory?: () => unknown;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onWebSocketClose?: () => void;
}

export interface FakeSubscription {
    id: string;
    unsubscribe: ReturnType<typeof vi.fn>;
}

// Replacement for the `@stomp/stompjs` Client (wired up in setupTests.ts). It never opens a
// socket; tests drive the connection state with `simulateConnect` / `simulateDisconnect`
export class Client {
    static readonly instances: Client[] = [];
    private static nextSubscriptionId = 0;

    config: FakeClientConfig;
    // Plain state rather than mock history, which Vitest clears before every test
    activated = false;
    activate = vi.fn(() => {
        this.activated = true;
    });
    deactivate = vi.fn();
    subscriptions: FakeSubscription[] = [];
    subscribe = vi.fn((_destination: string, _callback: (message: unknown) => void): FakeSubscription => {
        const subscription = { id: `sub-${Client.nextSubscriptionId++}`, unsubscribe: vi.fn() };
        this.subscriptions.push(subscription);
        return subscription;
    });
    publish = vi.fn();

    constructor(config: FakeClientConfig) {
        this.config = config;
        Client.instances.push(this);
    }

    simulateConnect(): void {
        this.config.onConnect?.();
    }

    simulateDisconnect(): void {
        this.config.onDisconnect?.();
    }

    simulateSocketClose(): void {
        this.config.onWebSocketClose?.();
    }
}

// The client created by the WebSocketService singleton, if it has been instantiated
export const stompClient = (): Client => {
    const client = Client.instances[0];
    if (!client) {
        throw new Error('WebSocketService has not created a STOMP client yet');
    }
    return client;
};

// Returns every fake client to the disconnected state
export const resetStomp = (): void => {
    for (const client of Client.instances) {
        client.simulateDisconnect();
    }
};

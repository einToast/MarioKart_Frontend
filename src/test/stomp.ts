import { vi } from 'vitest';

interface FakeClientConfig {
    webSocketFactory?: () => unknown;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

// Replacement for the `@stomp/stompjs` Client (wired up in setupTests.ts). It never opens a
// socket; tests drive the connection state with `simulateConnect` / `simulateDisconnect`
export class Client {
    static instances: Client[] = [];

    config: FakeClientConfig;
    // Plain state rather than mock history, which Vitest clears before every test
    activated = false;
    activate = vi.fn(() => {
        this.activated = true;
    });
    deactivate = vi.fn();
    subscribe = vi.fn();
    unsubscribe = vi.fn();
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

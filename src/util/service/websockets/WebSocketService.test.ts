import SockJS from 'sockjs-client';
import { Client, stompClient } from '../../../test/stomp';
import { WS_BASE_URL } from '../../api/config/constants';
import WebSocketService from './WebSocketService';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let cleanups: (() => void)[];

    beforeAll(() => {
        service = WebSocketService.getInstance();
    });

    beforeEach(() => {
        cleanups = [];
    });

    afterEach(() => {
        cleanups.forEach(cleanup => cleanup());
    });

    const subscribe = (topic: string, callback = vi.fn()) => {
        const unsubscribe = service.subscribe(topic, callback);
        cleanups.push(unsubscribe);
        return unsubscribe;
    };

    const listenToConnection = () => {
        const listener = vi.fn();
        cleanups.push(service.addConnectionListener(listener));
        return listener;
    };

    it('is a singleton that creates a single STOMP client', () => {
        expect(WebSocketService.getInstance()).toBe(service);
        expect(Client.instances).toHaveLength(1);
    });

    it('activates the client with reconnect and heartbeat settings', () => {
        expect(stompClient().activated).toBe(true);
        expect(stompClient().config).toMatchObject({
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
    });

    it('opens the socket through SockJS at the WebSocket base URL', () => {
        stompClient().config.webSocketFactory?.();

        expect(SockJS).toHaveBeenCalledWith(WS_BASE_URL);
    });

    it('tracks the connection state reported by the client', () => {
        expect(service.isConnected()).toBe(false);

        stompClient().simulateConnect();
        expect(service.isConnected()).toBe(true);

        stompClient().simulateDisconnect();
        expect(service.isConnected()).toBe(false);
    });

    it('notices a socket that closed without a DISCONNECT frame', () => {
        stompClient().simulateConnect();

        stompClient().simulateSocketClose();

        expect(service.isConnected()).toBe(false);
    });

    describe('while disconnected', () => {
        it('does not subscribe yet', () => {
            subscribe('/topic/rounds');

            expect(stompClient().subscribe).not.toHaveBeenCalled();
        });

        it('subscribes once the socket connects', () => {
            const callback = vi.fn();
            subscribe('/topic/rounds', callback);

            stompClient().simulateConnect();

            expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
            expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', callback);
        });

        it('forgets a subscription that ended before the socket connected', () => {
            const unsubscribe = subscribe('/topic/rounds');
            unsubscribe();

            stompClient().simulateConnect();

            expect(stompClient().subscribe).not.toHaveBeenCalled();
        });

        it('does not send messages', () => {
            service.sendMessage('/app/rounds', { id: 1 });

            expect(stompClient().publish).not.toHaveBeenCalled();
        });

        it('does not deactivate the client on disconnect', () => {
            service.disconnect();

            expect(stompClient().deactivate).not.toHaveBeenCalled();
        });
    });

    describe('while connected', () => {
        beforeEach(() => {
            stompClient().simulateConnect();
        });

        it('subscribes the callback to the topic', () => {
            const callback = vi.fn();

            subscribe('/topic/rounds', callback);

            expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', callback);
        });

        it('ends exactly the subscription it started', () => {
            const unsubscribe = subscribe('/topic/rounds');
            subscribe('/topic/questions');

            unsubscribe();

            const [rounds, questions] = stompClient().subscriptions.slice(-2);
            expect(rounds.unsubscribe).toHaveBeenCalledTimes(1);
            expect(questions.unsubscribe).not.toHaveBeenCalled();
        });

        it('subscribes again after the connection came back', () => {
            const callback = vi.fn();
            subscribe('/topic/rounds', callback);
            stompClient().subscribe.mockClear();

            stompClient().simulateSocketClose();
            stompClient().simulateConnect();

            expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
            expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', callback);
        });

        it('tells connection listeners about a drop and the reconnect', () => {
            const listener = listenToConnection();

            stompClient().simulateSocketClose();
            stompClient().simulateConnect();

            expect(listener.mock.calls).toEqual([[false, false], [true, true]]);
        });

        it('publishes messages as JSON', () => {
            service.sendMessage('/app/rounds', { id: 1, played: true });

            expect(stompClient().publish).toHaveBeenCalledWith({
                destination: '/app/rounds',
                body: '{"id":1,"played":true}',
            });
        });

        it('deactivates the client on disconnect', () => {
            service.disconnect();

            expect(stompClient().deactivate).toHaveBeenCalledTimes(1);
        });
    });
});

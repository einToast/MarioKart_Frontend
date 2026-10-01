import SockJS from 'sockjs-client';
import { Client, stompClient } from '../../../test/stomp';
import { WS_BASE_URL } from '../../api/config/constants';
import WebSocketService from './WebSocketService';

describe('WebSocketService', () => {
    let service: WebSocketService;

    beforeAll(() => {
        service = WebSocketService.getInstance();
    });

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

    describe('while disconnected', () => {
        it('does not subscribe', () => {
            service.subscribe('/topic/rounds', vi.fn());

            expect(stompClient().subscribe).not.toHaveBeenCalled();
        });

        it('does not unsubscribe', () => {
            service.unsubscribe('/topic/rounds');

            expect(stompClient().unsubscribe).not.toHaveBeenCalled();
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

            service.subscribe('/topic/rounds', callback);

            expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', callback);
        });

        it('unsubscribes from the topic', () => {
            service.unsubscribe('/topic/rounds');

            expect(stompClient().unsubscribe).toHaveBeenCalledWith('/topic/rounds');
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

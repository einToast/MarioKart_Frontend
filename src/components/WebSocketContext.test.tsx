import { render, renderHook } from '@testing-library/react';
import { stompClient } from '../test/stomp';
import WebSocketService from '../util/service/websockets/WebSocketService';
import { useWebSocket, WebSocketProvider } from './WebSocketContext';

describe('WebSocketContext', () => {
    it('provides the WebSocketService singleton to its children', () => {
        const { result } = renderHook(() => useWebSocket(), { wrapper: WebSocketProvider });

        expect(result.current).toBe(WebSocketService.getInstance());
    });

    it('refuses to be used outside of the provider', () => {
        // React reports the render error on the console as well
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => renderHook(() => useWebSocket())).toThrow('useWebSocket must be used within a WebSocketProvider');
    });

    it('closes the connection when the provider unmounts', () => {
        const { unmount } = render(<WebSocketProvider><p>App</p></WebSocketProvider>);
        stompClient().simulateConnect();

        unmount();

        expect(stompClient().deactivate).toHaveBeenCalledTimes(1);
    });

    it('keeps the connection open while the provider is mounted', () => {
        render(<WebSocketProvider><p>App</p></WebSocketProvider>);
        stompClient().simulateConnect();

        expect(stompClient().deactivate).not.toHaveBeenCalled();
    });
});

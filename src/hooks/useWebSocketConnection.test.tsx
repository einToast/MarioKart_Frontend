import { App as CapacitorApp } from '@capacitor/app';
import { act, renderHook } from '@testing-library/react';
import { createAppWrapper } from '../test/render';
import { stompClient } from '../test/stomp';
import { useWebSocketConnection } from './useWebSocketConnection';

vi.mock('@capacitor/app', () => ({ App: { addListener: vi.fn() } }));

type AppStateListener = (state: { isActive: boolean }) => void;

const addListener = vi.mocked(CapacitorApp.addListener);
const removeListener = vi.fn();

/** The appStateChange listener the hook registered with Capacitor. */
const appStateListener = (): AppStateListener => addListener.mock.calls[0][1] as unknown as AppStateListener;

const advance = (ms: number) => act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
});

const renderConnection = (onMessage = vi.fn()) =>
    renderHook(() => useWebSocketConnection('/topic/rounds', onMessage), { wrapper: createAppWrapper() });

describe('useWebSocketConnection', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        addListener.mockResolvedValue({ remove: removeListener });
    });

    it('reports a missing connection and does not subscribe while the socket is down', async () => {
        const { result } = renderConnection();

        await advance(2000);

        expect(result.current).toBe(false);
        expect(stompClient().subscribe).not.toHaveBeenCalled();
    });

    it('subscribes to the topic once the socket connects', async () => {
        const onMessage = vi.fn();
        const { result } = renderConnection(onMessage);

        stompClient().simulateConnect();
        await advance(500);

        expect(result.current).toBe(true);
        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
        expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', onMessage);
    });

    it('subscribes only once even though it keeps running', async () => {
        renderConnection();
        stompClient().simulateConnect();

        await advance(5000);

        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from the round and message topics when the component unmounts', async () => {
        const { unmount } = renderConnection();
        stompClient().simulateConnect();
        await advance(500);

        unmount();

        expect(stompClient().unsubscribe.mock.calls).toEqual([['/topic/rounds'], ['/topic/messages']]);
    });

    it('listens for the app returning to the foreground and stops listening on unmount', async () => {
        const { unmount } = renderConnection();
        await advance(0);

        expect(addListener).toHaveBeenCalledWith('appStateChange', expect.any(Function));

        unmount();

        expect(removeListener).toHaveBeenCalledTimes(1);
    });

    it('subscribes again when the app returns to the foreground', async () => {
        const onMessage = vi.fn();
        renderConnection(onMessage);
        stompClient().simulateConnect();
        await advance(500);
        stompClient().subscribe.mockClear();

        act(() => appStateListener()({ isActive: true }));
        await advance(1000);

        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
        expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', onMessage);
    });

    it('waits for the socket to reconnect before subscribing again', async () => {
        renderConnection();
        stompClient().simulateConnect();
        await advance(500);
        stompClient().simulateDisconnect();
        stompClient().subscribe.mockClear();

        act(() => appStateListener()({ isActive: true }));
        await advance(3000);
        expect(stompClient().subscribe).not.toHaveBeenCalled();

        stompClient().simulateConnect();
        await advance(1000);
        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
    });

    it('gives up waiting for a reconnect after ten seconds', async () => {
        renderConnection();
        stompClient().simulateConnect();
        await advance(500);
        stompClient().simulateDisconnect();
        stompClient().subscribe.mockClear();

        act(() => appStateListener()({ isActive: true }));
        await advance(10_000);
        stompClient().simulateConnect();
        await advance(5000);

        expect(stompClient().subscribe).not.toHaveBeenCalled();
    });

    it('does nothing when the app moves to the background', async () => {
        renderConnection();
        stompClient().simulateConnect();
        await advance(500);
        stompClient().subscribe.mockClear();

        act(() => appStateListener()({ isActive: false }));
        await advance(5000);

        expect(stompClient().subscribe).not.toHaveBeenCalled();
    });
});

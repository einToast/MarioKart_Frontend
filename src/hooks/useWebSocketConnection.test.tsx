import { act, renderHook } from '@testing-library/react';
import { createAppWrapper } from '../test/render';
import { stompClient } from '../test/stomp';
import { reloadDelay } from '../util/service/websockets/reloadDelay';
import { useWebSocketConnection } from './useWebSocketConnection';

const latestHandler = () => stompClient().subscribe.mock.calls.at(-1)?.[1] as () => void;

const connectAndSettle = () => {
    act(() => stompClient().simulateConnect());
    act(() => vi.runAllTimers());
};

const renderConnection = (onMessage: () => void = vi.fn(), topic = '/topic/rounds') =>
    renderHook(({ callback, url }) => useWebSocketConnection(url, callback), {
        wrapper: createAppWrapper(),
        initialProps: { callback: onMessage, url: topic },
    });

describe('useWebSocketConnection', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('reports a missing connection and does not subscribe while the socket is down', () => {
        const { result } = renderConnection();

        expect(result.current).toBe(false);
        expect(stompClient().subscribe).not.toHaveBeenCalled();
    });

    it('subscribes to the topic once the socket connects', () => {
        const onMessage = vi.fn();
        const { result } = renderConnection(onMessage);

        act(() => stompClient().simulateConnect());

        expect(result.current).toBe(true);
        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
        expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', expect.any(Function));

        latestHandler()();
        act(() => vi.runAllTimers());
        expect(onMessage).toHaveBeenCalledTimes(1);
    });

    it('keeps one subscription while the page re-renders with new callbacks', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderConnection(first);
        connectAndSettle();
        first.mockClear();

        rerender({ callback: second, url: '/topic/rounds' });
        rerender({ callback: second, url: '/topic/rounds' });

        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
        latestHandler()();
        act(() => vi.runAllTimers());
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('ends its subscription when the component unmounts', () => {
        const { unmount } = renderConnection();
        act(() => stompClient().simulateConnect());

        unmount();

        expect(stompClient().subscriptions.at(-1)?.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('subscribes again and refreshes after a dropped connection came back', () => {
        const onMessage = vi.fn();
        const { result } = renderConnection(onMessage);
        connectAndSettle();
        stompClient().subscribe.mockClear();
        onMessage.mockClear();

        act(() => stompClient().simulateSocketClose());
        expect(result.current).toBe(false);

        act(() => stompClient().simulateConnect());
        act(() => vi.runAllTimers());

        expect(result.current).toBe(true);
        expect(stompClient().subscribe).toHaveBeenCalledTimes(1);
        expect(onMessage).toHaveBeenCalledTimes(1);
    });

    it('reloads after a random delay so that the clients do not all reload at once', () => {
        const onMessage = vi.fn();
        renderConnection(onMessage);
        connectAndSettle();
        onMessage.mockClear();
        vi.mocked(reloadDelay).mockReturnValueOnce(700);

        latestHandler()();
        act(() => vi.advanceTimersByTime(699));
        expect(onMessage).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));
        expect(onMessage).toHaveBeenCalledTimes(1);
    });

    it('drops a pending reload when the component unmounts', () => {
        const onMessage = vi.fn();
        const { unmount } = renderConnection(onMessage);
        connectAndSettle();
        onMessage.mockClear();
        vi.mocked(reloadDelay).mockReturnValueOnce(500);

        latestHandler()();
        unmount();
        act(() => vi.runAllTimers());

        expect(onMessage).not.toHaveBeenCalled();
    });
});

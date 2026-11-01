import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../components/WebSocketContext';
import { reloadDelay } from '../util/service/websockets/reloadDelay';

export const useWebSocketConnection = (topic: string, onMessageReceived: () => void) => {
    const wsService = useWebSocket();
    const [isConnected, setIsConnected] = useState<boolean>(wsService.isConnected());

    const callbackRef = useRef(onMessageReceived);
    useEffect(() => {
        callbackRef.current = onMessageReceived;
    });

    useEffect(() => {
        const pendingReloads = new Set<ReturnType<typeof setTimeout>>();
        const reloadSoon = () => {
            const timer = setTimeout(() => {
                pendingReloads.delete(timer);
                callbackRef.current();
            }, reloadDelay());
            pendingReloads.add(timer);
        };

        setIsConnected(wsService.isConnected());
        const unsubscribe = wsService.subscribe(topic, reloadSoon);
        const removeConnectionListener = wsService.addConnectionListener((connected, reconnected) => {
            setIsConnected(connected);
            if (reconnected) {
                reloadSoon();
            }
        });

        return () => {
            unsubscribe();
            removeConnectionListener();
            pendingReloads.forEach(clearTimeout);
        };
    }, [wsService, topic]);

    return isConnected;
};

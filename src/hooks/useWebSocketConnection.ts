import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../components/WebSocketContext';

export const useWebSocketConnection = (topic: string, onMessageReceived: () => void) => {
    const wsService = useWebSocket();
    const [isConnected, setIsConnected] = useState<boolean>(wsService.isConnected());

    const callbackRef = useRef(onMessageReceived);
    useEffect(() => {
        callbackRef.current = onMessageReceived;
    });

    useEffect(() => {
        setIsConnected(wsService.isConnected());
        const unsubscribe = wsService.subscribe(topic, () => callbackRef.current());
        const removeConnectionListener = wsService.addConnectionListener((connected, reconnected) => {
            setIsConnected(connected);
            if (reconnected) {
                callbackRef.current();
            }
        });

        return () => {
            unsubscribe();
            removeConnectionListener();
        };
    }, [wsService, topic]);

    return isConnected;
};

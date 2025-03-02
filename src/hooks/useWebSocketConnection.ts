import { App as CapacitorApp } from '@capacitor/app';
import { useEffect, useState } from 'react';
import { useWebSocket } from '../components/WebSocketContext';

export const useWebSocketConnection = (onMessageReceived: () => void) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const wsService = useWebSocket();

    useEffect(() => {
        const checkConnection = setInterval(() => {
            if (wsService.isConnected()) {
                setIsConnected(true);
                clearInterval(checkConnection);
            }
        }, 500);

        CapacitorApp.addListener('appStateChange', (state) => {
            if (!state.isActive) {
                if (wsService) {
                    wsService.unsubscribe('/topic/rounds');
                }
            } else {
                if (!wsService.isConnected()) {
                    wsService.subscribe('/topic/rounds', onMessageReceived);
                }
            }
        });

        return () => {
            clearInterval(checkConnection);
        };
    }, [wsService]);

    useEffect(() => {
        if (isConnected) {
            wsService.subscribe('/topic/rounds', onMessageReceived);

            return () => {
                wsService.unsubscribe('/topic/rounds');
                wsService.unsubscribe('/topic/messages');
            };
        }
    }, [isConnected, wsService]);

    return isConnected;
}; 
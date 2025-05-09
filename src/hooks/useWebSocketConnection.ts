import { App as CapacitorApp } from '@capacitor/app';
import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from '../components/WebSocketContext';

export const useWebSocketConnection = (url, onMessageReceived: () => void) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const wsService = useWebSocket();

    const setupSubscriptions = useCallback(() => {
        if (wsService.isConnected()) {
            wsService.subscribe(url, onMessageReceived);
        }
    }, [wsService, onMessageReceived, url]);

    useEffect(() => {
        const checkConnection = setInterval(() => {
            if (wsService.isConnected()) {
                setIsConnected(true);
                clearInterval(checkConnection);
            }
        }, 500);

        const setupAppStateListener = async () => {
            const subscription = await CapacitorApp.addListener('appStateChange', (state) => {
                if (state.isActive) {
                    const reconnectInterval = setInterval(() => {
                        if (wsService.isConnected()) {
                            setIsConnected(true);
                            setupSubscriptions();
                            clearInterval(reconnectInterval);
                        }
                    }, 1000);

                    setTimeout(() => clearInterval(reconnectInterval), 10000);
                }
            });
            return subscription;
        };

        let subscription: any;
        setupAppStateListener().then(sub => {
            subscription = sub;
        });

        return () => {
            clearInterval(checkConnection);
            if (subscription) {
                subscription.remove();
            }
        };
    }, [wsService, setupSubscriptions]);

    useEffect(() => {
        if (isConnected) {
            setupSubscriptions();

            return () => {
                wsService.unsubscribe('/topic/rounds');
                wsService.unsubscribe('/topic/messages');
            };
        }
    }, [isConnected, setupSubscriptions, wsService]);

    return isConnected;
};
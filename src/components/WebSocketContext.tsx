import React, { createContext, useContext, useEffect } from 'react';
import WebSocketService from "../util/service/websockets/WebSocketService";
import { WebSocketProviderProps } from '../util/api/config/interfaces';

// Erstelle den WebSocketContext
const WebSocketContext = createContext<WebSocketService | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const wsService = WebSocketService.getInstance();

    useEffect(() => {
        // Cleanup oder WebSocket-Verbindung trennen bei Unmount
        return () => {
            wsService.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={wsService}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom Hook, um den WebSocketContext zu verwenden
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === null) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

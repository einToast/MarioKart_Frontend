import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import WebSocketService from "../util/service/WebSocketService";

// Erstelle den WebSocketContext
const WebSocketContext = createContext<WebSocketService | null>(null);

// Typ für den Provider (mit children Prop als ReactNode)
interface WebSocketProviderProps {
    children: ReactNode; // Typ für children explizit festlegen
}

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

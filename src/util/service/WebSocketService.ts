// src/services/WebSocketService.ts
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from "../api/config/constants";

class WebSocketService {
    private static instance: WebSocketService;
    private client: Client;
    private connected: boolean = false;

    private constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                this.connected = true;
                console.log('Connected to WebSocket');
            },
            onDisconnect: () => {
                this.connected = false;
                console.log('Disconnected from WebSocket');
            },
        });

        this.client.activate();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public subscribe(topic: string, callback: (message: Message) => void): void {
        if (this.connected) {
            this.client.subscribe(topic, callback);
        } else {
            console.log('WebSocket is not connected');
        }
    }

    public sendMessage(destination: string, body: any): void {
        if (this.connected) {
            this.client.publish({ destination, body: JSON.stringify(body) });
        } else {
            console.log('WebSocket is not connected');
        }
    }
    public unsubscribe(topic: string): void {
        if (this.connected) {
            this.client.unsubscribe(topic);
        } else {
            console.log('WebSocket is not connected');
        }
    }
    public disconnect(): void {
        if (this.connected) {
            this.client.deactivate();
        }
    }
}

export default WebSocketService;

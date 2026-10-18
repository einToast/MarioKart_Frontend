// src/services/WebSocketService.ts
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from "../../api/config/constants";
import { TopicListener } from '../../api/config/interfaces';

export type ConnectionListener = (connected: boolean, reconnected: boolean) => void;

class WebSocketService {
    private static instance: WebSocketService;
    private readonly client: Client;
    private connected: boolean = false;
    private hasConnected: boolean = false;
    private readonly topicListeners = new Set<TopicListener>();
    private readonly connectionListeners = new Set<ConnectionListener>();

    private constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                const reconnected = this.hasConnected;
                this.connected = true;
                this.hasConnected = true;
                console.log('Connected to WebSocket');
                this.topicListeners.forEach(listener => this.attach(listener));
                this.connectionListeners.forEach(listener => listener(true, reconnected));
            },
            onDisconnect: () => {
                this.markDisconnected();
                console.log('Disconnected from WebSocket');
            },
            onWebSocketClose: () => {
                this.markDisconnected();
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

    public subscribe(topic: string, callback: (message: Message) => void): () => void {
        const listener: TopicListener = { topic, callback };
        this.topicListeners.add(listener);
        if (this.connected) {
            this.attach(listener);
        }

        return () => {
            this.topicListeners.delete(listener);
            if (this.connected) {
                listener.subscription?.unsubscribe();
            }
            listener.subscription = undefined;
        };
    }

    public addConnectionListener(listener: ConnectionListener): () => void {
        this.connectionListeners.add(listener);
        return () => {
            this.connectionListeners.delete(listener);
        };
    }

    public sendMessage(destination: string, body: any): void {
        if (this.connected) {
            this.client.publish({ destination, body: JSON.stringify(body) });
        } else {
            console.log('WebSocket is not connected');
        }
    }

    public disconnect(): void {
        if (this.connected) {
            this.client.deactivate();
        }
    }

    private attach(listener: TopicListener): void {
        listener.subscription = this.client.subscribe(listener.topic, listener.callback);
    }

    private markDisconnected(): void {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        this.topicListeners.forEach(listener => {
            listener.subscription = undefined;
        });
        this.connectionListeners.forEach(listener => listener(false, false));
    }
}

export default WebSocketService;

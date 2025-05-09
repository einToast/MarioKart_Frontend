import { PublicNotificationApi } from "../../api";
import { NotificationSubscriptionDTO } from "../../api/config/dto";
import { PublicCookiesService } from "../cookies";

export class NotificationService {
    private static convertedVapidKey: Uint8Array | undefined;

    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        try {
            return await navigator.serviceWorker.register('/sw.js');
        } catch (err) {
            return null;
        }
    }

    static async subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
        try {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: await this.getPublicKey()
            };

            const subscription = await registration.pushManager.subscribe(subscribeOptions);
            await this.sendSubscriptionToServer(subscription);
            return subscription;
        } catch (err) {
            return null;
        }
    }

    private static async getPublicKey(): Promise<Uint8Array> {
        if (!this.convertedVapidKey) {
            try {
                const response = await PublicNotificationApi.getPublicKey();


                const vapidPublicKey = response

                if (vapidPublicKey && !vapidPublicKey.includes('<!DOCTYPE html>')) {
                    this.convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey.trim());
                } else {
                    throw new Error('Ungültiger Public Key vom Server erhalten');
                }
            } catch (error) {
                throw error;
            }
        }
        return this.convertedVapidKey;
    }

    private static async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        const subscriptionData: NotificationSubscriptionDTO = {
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0)))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0)))),
            teamId: PublicCookiesService.getUser()?.teamId || 0
        };

        await PublicNotificationApi.subscribe(subscriptionData);
    }

    private static urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
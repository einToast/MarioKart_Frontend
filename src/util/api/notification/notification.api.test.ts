import { describeEndpoint } from '../../../test/endpoint';
import { NotificationRequestDTO, NotificationSubscriptionDTO } from '../config/dto';
import { AdminNotificationApi, PublicNotificationApi } from './index';

const notification: NotificationRequestDTO = { title: 'Runde 3', message: 'Es geht los' };
const subscription: NotificationSubscriptionDTO = {
    endpoint: 'https://push.example/abc',
    p256dh: 'cDI1NmRo',
    auth: 'YXV0aA==',
    teamId: 4,
};

const SEND_FAILED = 'Benachrichtigung konnte nicht gesendet werden';
const SUBSCRIBE_FAILED = 'Benachrichtigungen konnten nicht aktiviert werden';

describe('PublicNotificationApi', () => {
    describeEndpoint('subscribe', {
        call: () => PublicNotificationApi.subscribe(subscription),
        method: 'POST',
        url: '/public/notification/subscribe',
        body: subscription,
        returnsVoid: true,
        errors: {
            401: 'Nicht autorisierter Zugriff',
            500: SUBSCRIBE_FAILED,
        },
        fallback: SUBSCRIBE_FAILED,
    });

    describeEndpoint('getPublicKey', {
        call: () => PublicNotificationApi.getPublicKey(),
        method: 'GET',
        url: '/public/notification/public-key',
        response: 'BPublicVapidKey',
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Öffentlicher Schlüssel konnte nicht geladen werden',
    });
});

describe('AdminNotificationApi', () => {
    describeEndpoint('sendNotificationToAll', {
        call: () => AdminNotificationApi.sendNotificationToAll(notification),
        method: 'POST',
        url: '/admin/notification/send',
        body: notification,
        returnsVoid: true,
        errors: {
            401: 'Nicht autorisierter Zugriff',
            500: SEND_FAILED,
        },
        fallback: SEND_FAILED,
    });

    describeEndpoint('getSubscriptionCount', {
        call: () => AdminNotificationApi.getSubscriptionCount(),
        method: 'GET',
        url: '/admin/notification/subscriptions/count',
        response: 12,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Anzahl der Abonnements konnte nicht geladen werden',
    });

    describeEndpoint('sendNotificationToTeam', {
        call: () => AdminNotificationApi.sendNotificationToTeam(4, notification),
        method: 'POST',
        url: '/admin/notification/send/4',
        body: notification,
        returnsVoid: true,
        errors: {
            401: 'Nicht autorisierter Zugriff',
            500: SEND_FAILED,
        },
        fallback: SEND_FAILED,
    });
});

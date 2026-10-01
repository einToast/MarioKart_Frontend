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

// The notification endpoints reuse the final-schedule wording as their generic error message.
// These tests pin the current behaviour; a clearer message would have to be updated here too
const NOTIFICATION_FALLBACK = 'Finalrunden konnten nicht erstellt werden';

describe('PublicNotificationApi', () => {
    describeEndpoint('subscribe', {
        call: () => PublicNotificationApi.subscribe(subscription),
        method: 'POST',
        url: '/public/notification/subscribe',
        body: subscription,
        returnsVoid: true,
        errors: {
            401: 'Nicht autorisierter Zugriff',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: NOTIFICATION_FALLBACK,
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
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: NOTIFICATION_FALLBACK,
    });

    describeEndpoint('sendNotificationToTeam', {
        call: () => AdminNotificationApi.sendNotificationToTeam(4, notification),
        method: 'POST',
        url: '/admin/notification/send/4',
        body: notification,
        returnsVoid: true,
        errors: {
            401: 'Nicht autorisierter Zugriff',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: NOTIFICATION_FALLBACK,
    });
});

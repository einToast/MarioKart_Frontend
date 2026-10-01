import { backend } from '../../../test/backend';
import { loginAsTeam } from '../../../test/render';
import { AdminNotificationService, NotificationService, PublicNotificationService } from './index';

const PUBLIC_KEY_URL = '/public/notification/public-key';
const SUBSCRIBE_URL = '/public/notification/subscribe';

const bytes = (...values: number[]): ArrayBuffer => new Uint8Array(values).buffer;

const makeSubscription = (keys: Record<string, ArrayBuffer | null> = { p256dh: bytes(1, 2, 3), auth: bytes(4, 5, 6) }) => ({
    endpoint: 'https://push.example/abc',
    getKey: vi.fn((name: string) => keys[name] ?? null),
}) as unknown as PushSubscription;

const makeRegistration = (subscribe: ReturnType<typeof vi.fn>) =>
    ({ pushManager: { subscribe } }) as unknown as ServiceWorkerRegistration;

/** The converted VAPID key is cached in a private static; clear it so tests stay independent. */
const clearCachedPublicKey = () => {
    (NotificationService as unknown as { convertedVapidKey?: Uint8Array }).convertedVapidKey = undefined;
};

describe('NotificationService', () => {
    beforeEach(() => {
        clearCachedPublicKey();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    });

    describe('requestPermission', () => {
        it('resolves to false when the browser has no Notification API', async () => {
            await expect(NotificationService.requestPermission()).resolves.toBe(false);
        });

        it('resolves to true when the user grants permission', async () => {
            vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue('granted') });

            await expect(NotificationService.requestPermission()).resolves.toBe(true);
        });

        it.each(['denied', 'default'])('resolves to false when the permission is "%s"', async (permission) => {
            vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue(permission) });

            await expect(NotificationService.requestPermission()).resolves.toBe(false);
        });
    });

    describe('registerServiceWorker', () => {
        const stubServiceWorker = (register: ReturnType<typeof vi.fn>) => {
            Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });
        };

        it('resolves to null when the browser does not support service workers', async () => {
            await expect(NotificationService.registerServiceWorker()).resolves.toBeNull();
        });

        it('registers /sw.js and returns the registration', async () => {
            const registration = makeRegistration(vi.fn());
            const register = vi.fn().mockResolvedValue(registration);
            stubServiceWorker(register);

            await expect(NotificationService.registerServiceWorker()).resolves.toBe(registration);
            expect(register).toHaveBeenCalledWith('/sw.js');
        });

        it('resolves to null when the registration fails', async () => {
            stubServiceWorker(vi.fn().mockRejectedValue(new Error('blocked')));

            await expect(NotificationService.registerServiceWorker()).resolves.toBeNull();
        });
    });

    describe('subscribeToPushNotifications', () => {
        it('subscribes with the decoded VAPID key and registers the subscription for the team', async () => {
            loginAsTeam({ teamId: 4 });
            backend.get(PUBLIC_KEY_URL, 'AQIDBA').post(SUBSCRIBE_URL);
            const subscription = makeSubscription();
            const subscribe = vi.fn().mockResolvedValue(subscription);

            const result = await NotificationService.subscribeToPushNotifications(makeRegistration(subscribe));

            expect(result).toBe(subscription);
            expect(subscribe).toHaveBeenCalledWith({
                userVisibleOnly: true,
                applicationServerKey: new Uint8Array([1, 2, 3, 4]),
            });
            expect(backend.requestsTo('POST', SUBSCRIBE_URL)).toEqual([{
                method: 'POST',
                url: SUBSCRIBE_URL,
                body: { endpoint: 'https://push.example/abc', p256dh: 'AQID', auth: 'BAUG', teamId: 4 },
            }]);
        });

        it('decodes URL-safe base64 keys and ignores surrounding whitespace', async () => {
            backend.get(PUBLIC_KEY_URL, ' -_8 \n').post(SUBSCRIBE_URL);
            const subscribe = vi.fn().mockResolvedValue(makeSubscription());

            await NotificationService.subscribeToPushNotifications(makeRegistration(subscribe));

            expect(subscribe.mock.calls[0][0].applicationServerKey).toEqual(new Uint8Array([0xfb, 0xff]));
        });

        it('fetches the public key only once across subscriptions', async () => {
            backend.get(PUBLIC_KEY_URL, 'AQIDBA').post(SUBSCRIBE_URL);
            const registration = makeRegistration(vi.fn().mockResolvedValue(makeSubscription()));

            await NotificationService.subscribeToPushNotifications(registration);
            await NotificationService.subscribeToPushNotifications(registration);

            expect(backend.requestsTo('GET', PUBLIC_KEY_URL)).toHaveLength(1);
            expect(backend.requestsTo('POST', SUBSCRIBE_URL)).toHaveLength(2);
        });

        it('registers the subscription with team 0 and empty keys when neither is available', async () => {
            backend.get(PUBLIC_KEY_URL, 'AQIDBA').post(SUBSCRIBE_URL);
            const subscribe = vi.fn().mockResolvedValue(makeSubscription({}));

            await NotificationService.subscribeToPushNotifications(makeRegistration(subscribe));

            expect(backend.requestsTo('POST', SUBSCRIBE_URL)[0].body).toEqual({
                endpoint: 'https://push.example/abc', p256dh: '', auth: '', teamId: 0,
            });
        });

        it('resolves to null without subscribing when the server answers with an HTML page instead of a key', async () => {
            backend.get(PUBLIC_KEY_URL, '<!DOCTYPE html><html></html>');
            const subscribe = vi.fn();

            await expect(NotificationService.subscribeToPushNotifications(makeRegistration(subscribe))).resolves.toBeNull();
            expect(subscribe).not.toHaveBeenCalled();
        });

        it('resolves to null when the public key cannot be loaded', async () => {
            backend.fail('GET', PUBLIC_KEY_URL, 500);

            await expect(NotificationService.subscribeToPushNotifications(makeRegistration(vi.fn()))).resolves.toBeNull();
        });

        it('resolves to null when the browser refuses the push subscription', async () => {
            backend.get(PUBLIC_KEY_URL, 'AQIDBA');
            const subscribe = vi.fn().mockRejectedValue(new Error('denied'));

            await expect(NotificationService.subscribeToPushNotifications(makeRegistration(subscribe))).resolves.toBeNull();
            expect(backend.requestsTo('POST', SUBSCRIBE_URL)).toEqual([]);
        });

        it('resolves to null when the backend rejects the subscription', async () => {
            backend.get(PUBLIC_KEY_URL, 'AQIDBA').fail('POST', SUBSCRIBE_URL, 500);
            const subscribe = vi.fn().mockResolvedValue(makeSubscription());

            await expect(NotificationService.subscribeToPushNotifications(makeRegistration(subscribe))).resolves.toBeNull();
        });
    });
});

describe('PublicNotificationService', () => {
    it('subscribe forwards the subscription data', async () => {
        backend.post(SUBSCRIBE_URL);
        const data = { endpoint: 'https://push.example/abc', p256dh: 'AQID', auth: 'BAUG', teamId: 2 };

        await PublicNotificationService.subscribe(data);

        expect(backend.requests).toEqual([{ method: 'POST', url: SUBSCRIBE_URL, body: data }]);
    });

    it('getPublicKey returns the key from the backend', async () => {
        backend.get(PUBLIC_KEY_URL, 'AQIDBA');

        await expect(PublicNotificationService.getPublicKey()).resolves.toBe('AQIDBA');
    });
});

describe('AdminNotificationService', () => {
    it('sendNotificationToAll posts title and message to every team', async () => {
        backend.post('/admin/notification/send');

        await AdminNotificationService.sendNotificationToAll('Pause', 'Pizza ist da');

        expect(backend.requests).toEqual([{
            method: 'POST',
            url: '/admin/notification/send',
            body: { title: 'Pause', message: 'Pizza ist da' },
        }]);
    });

    it('sendNotificationToTeam posts title and message to the given team', async () => {
        backend.post('/admin/notification/send/4');

        await AdminNotificationService.sendNotificationToTeam(4, 'Runde 3', 'Ihr seid dran');

        expect(backend.requests).toEqual([{
            method: 'POST',
            url: '/admin/notification/send/4',
            body: { title: 'Runde 3', message: 'Ihr seid dran' },
        }]);
    });

    it('propagates the API error message', async () => {
        backend.fail('POST', '/admin/notification/send', 401);

        await expect(AdminNotificationService.sendNotificationToAll('a', 'b'))
            .rejects.toThrow('Nicht autorisierter Zugriff');
    });
});

import { fireEvent, screen, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { backend, stubDefaultBackend, stubScheduleState } from '../test/backend';
import { expectErrorToast, expectSuccessToast, queryToast } from '../test/overlays';
import { buttonOf, currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import { makeSwitches } from '../test/fixtures';
import { createDefaultFloorPlan, serializeFloorPlan } from '../util/layout/floorPlan';
import { serializeProgram } from '../util/layout/program';
import { NotificationService } from '../util/service';
import Tab3 from './Tab3';

// The real QRCodeCanvas paints onto a canvas, which jsdom does not implement
vi.mock('qrcode.react', () => ({
    QRCodeCanvas: ({ value }: { value: string }) => <canvas data-testid="qr-code" data-value={value} />,
}));

const ENABLE = 'Benachrichtigungen aktivieren';
const ENABLED = 'Benachrichtigungen aktiviert';

const renderPage = () => {
    const setShowTab2 = vi.fn();
    const view = renderWithRouter(<Tab3 showTab2={true} setShowTab2={setShowTab2} />, { route: '/tab3' });
    return { ...view, setShowTab2 };
};

// Makes the browser grant (or refuse) notifications and provide a working push manager
const stubPushSupport = ({ permission = 'granted', subscribe }: { permission?: string; subscribe?: ReturnType<typeof vi.fn> } = {}) => {
    const subscription = { endpoint: 'https://push.example/abc', getKey: () => new Uint8Array([1, 2, 3]).buffer };
    const pushSubscribe = subscribe ?? vi.fn().mockResolvedValue(subscription);
    vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue(permission) });
    Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { register: vi.fn().mockResolvedValue({ pushManager: { subscribe: pushSubscribe } }) },
    });
    return pushSubscribe;
};

describe('Tab3 (details)', () => {
    beforeEach(() => {
        stubDefaultBackend();
        loginAsTeam({ teamId: 4 });
        (NotificationService as unknown as { convertedVapidKey?: Uint8Array }).convertedVapidKey = undefined;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    });

    it('shows the programme and a QR code of the site', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
        expect(screen.getByText('Siegerehrung', { exact: false })).toHaveTextContent('21:00 Siegerehrung');
        expect(screen.getByTestId('qr-code')).toHaveAttribute('data-value', window.location.origin);
    });

    it('shows the default programme while none is stored', () => {
        const { container } = renderPage();

        expect(Array.from(container.querySelectorAll('.progressContainer p span')).map(time => time.textContent)).toEqual([
            '16:00 - 16:45', '16:45 - 18:30', '18:30 - 19:00', '19:00 - 20:00', '20:00 - 20:45', '21:00',
        ]);
    });

    it('shows the stored programme', async () => {
        backend.get('/public/settings', {
            tournamentOpen: true,
            program: serializeProgram([{ icon: 'trophy', time: '12:00', text: 'Los gehts' }]),
        });

        renderPage();

        expect(await screen.findByText('Los gehts', { exact: false })).toHaveTextContent('12:00 Los gehts');
        expect(screen.queryByText('Siegerehrung', { exact: false })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Programm' })).toBeInTheDocument();
    });

    it('hides the programme when it was saved without entries', async () => {
        backend.get('/public/settings', { tournamentOpen: true, program: serializeProgram([]) });

        renderPage();

        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Programm' })).not.toBeInTheDocument());
    });

    it('draws the stored room plan with the configured switches', async () => {
        backend.get('/public/settings', {
            tournamentOpen: true,
            switches: makeSwitches().slice(0, 2),
            floorPlan: serializeFloorPlan(createDefaultFloorPlan(2)),
        });

        renderPage();

        expect(await screen.findByRole('img', { name: 'Raumplan' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Raumplan' })).toBeInTheDocument();
        expect(screen.getByText('switch blau')).toBeInTheDocument();
        expect(screen.getByText('switch rot')).toBeInTheDocument();
    });

    it.each([
        ['no plan is stored', null],
        ['the stored plan is empty', '{"elements":[]}'],
        ['the stored plan is unreadable', 'not json'],
    ])('hides the room plan while %s', async (_name, floorPlan) => {
        backend.get('/public/settings', { tournamentOpen: true, switches: makeSwitches(), floorPlan });

        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalled());
        expect(screen.queryByRole('heading', { name: 'Raumplan' })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'Raumplan' })).not.toBeInTheDocument();
    });

    it('links to the source code', () => {
        renderPage();

        expect(screen.getByRole('link', { name: 'Source Code' })).toHaveAttribute('href', 'https://github.com/einToast/MarioKart_Tournament');
    });

    it('links to the admin login', () => {
        renderPage();
        const link = screen.getByRole('link', { name: 'Admin Login' });

        expect(link).toHaveAttribute('href', '/admin/login');
        fireEvent.click(link);

        expect(currentPath()).toBe('/admin/login');
    });

    it('sends the team to the admin area while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin'));
    });

    it('hides the ranking tab during the last round of the group phase', async () => {
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 1 });

        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(false));
    });

    it('updates the ranking tab on pull-to-refresh', async () => {
        const { container, setShowTab2 } = renderPage();
        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(true));
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 0 });

        const complete = pullToRefresh(container);

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(setShowTab2).toHaveBeenLastCalledWith(false);
    });

    describe('push notifications', () => {
        it('offers to enable notifications', () => {
            renderPage();

            expect(buttonOf(ENABLE).disabled).toBe(false);
        });

        it('shows notifications as enabled when they were enabled before', () => {
            Cookies.set('notificationsEnabled', 'true');

            renderPage();

            expect(buttonOf(ENABLED).disabled).toBe(true);
        });

        it('subscribes the team and remembers that notifications are enabled', async () => {
            const subscribe = stubPushSupport();
            backend.get('/public/notification/public-key', 'AQIDBA').post('/public/notification/subscribe');
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectSuccessToast('Benachrichtigungen erfolgreich aktiviert!');
            expect(subscribe).toHaveBeenCalledTimes(1);
            expect(backend.requestsTo('POST', '/public/notification/subscribe')[0].body).toMatchObject({
                endpoint: 'https://push.example/abc',
                teamId: 4,
            });
            expect(Cookies.get('notificationsEnabled')).toBe('true');
            expect(buttonOf(ENABLED).disabled).toBe(true);
        });

        it('asks the user to allow notifications when the permission is refused', async () => {
            stubPushSupport({ permission: 'denied' });
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectErrorToast('Bitte erlaube Benachrichtigungen in deinen Browsereinstellungen.');
            expect(Cookies.get('notificationsEnabled')).toBeUndefined();
            expect(backend.requestsTo('POST', '/public/notification/subscribe')).toEqual([]);
        });

        it('asks the user to allow notifications when the browser does not support them', async () => {
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectErrorToast('Bitte erlaube Benachrichtigungen in deinen Browsereinstellungen.');
        });

        it('reports a failed subscription and leaves notifications disabled', async () => {
            stubPushSupport({ subscribe: vi.fn().mockRejectedValue(new Error('denied')) });
            backend.get('/public/notification/public-key', 'AQIDBA');
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectErrorToast('Fehler beim Aktivieren der Benachrichtigungen. Bitte lade die Seite komplett neu.');
            expect(Cookies.get('notificationsEnabled')).toBeUndefined();
            expect(buttonOf(ENABLE).disabled).toBe(false);
        });

        it('reports a subscription the backend rejected', async () => {
            stubPushSupport();
            backend.get('/public/notification/public-key', 'AQIDBA').fail('POST', '/public/notification/subscribe', 500);
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectErrorToast('Fehler beim Aktivieren der Benachrichtigungen. Bitte lade die Seite komplett neu.');
        });

        it('stays silent when the service worker cannot be registered', async () => {
            const requestPermission = vi.fn().mockResolvedValue('granted');
            vi.stubGlobal('Notification', { requestPermission });
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await waitFor(() => expect(requestPermission).toHaveBeenCalled());
            await Promise.resolve();
            expect(queryToast()).not.toBeInTheDocument();
            expect(buttonOf(ENABLE).disabled).toBe(false);
        });

        it('alerts the user when enabling fails unexpectedly', async () => {
            const alert = vi.fn();
            vi.stubGlobal('alert', alert);
            vi.stubGlobal('Notification', { requestPermission: vi.fn().mockRejectedValue(new Error('boom')) });
            renderPage();

            fireEvent.click(screen.getByText(ENABLE));

            await expectErrorToast('Es ist ein Fehler aufgetreten. Bitte lade die Seite komplett neu.');
            expect(alert).toHaveBeenCalledWith('Es ist ein Fehler aufgetreten. Bitte lade die Seite komplett neu.');
        });
    });
});

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend, stubLoggedOutAdmin, stubScheduleState } from '../../test/backend';
import { expectErrorToast, queryToast } from '../../test/overlays';
import { buttonOf, currentPath, renderWithRouter } from '../../test/render';
import Dashboard from './Dashboard';
import Login from './Login';

describe('admin Login', () => {
    const ENTER = 'Admin Bereich betreten';

    const renderPage = () => renderWithRouter(<Login />, { route: '/admin/login' });
    const usernameInput = () => screen.getByPlaceholderText('Benutzername');
    const passwordInput = () => screen.getByPlaceholderText('Passwort');
    const enterCredentials = (username: string, password: string) => {
        fireEvent.change(usernameInput(), { target: { value: username } });
        fireEvent.change(passwordInput(), { target: { value: password } });
    };

    beforeEach(() => {
        stubLoggedOutAdmin();
    });

    it('shows the login form to visitors without a session', async () => {
        renderPage();

        await waitFor(() => expect(backend.requestsTo('GET', '/public/user/login/check')).toHaveLength(1));
        expect(currentPath()).toBe('/admin/login');
        expect(usernameInput()).toHaveValue('');
        expect(passwordInput()).toHaveAttribute('type', 'password');
    });

    it('skips the form for an admin who is already logged in', async () => {
        stubDefaultBackend();

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
    });

    it('logs in with the entered credentials and opens the dashboard', async () => {
        backend.post('/public/user/login', { user: { username: 'admin', isAdmin: true, ID: 1 } });
        renderPage();

        enterCredentials('admin', 'secret');
        fireEvent.click(screen.getByText(ENTER));

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
        expect(backend.requestsTo('POST', '/public/user/login')[0].body).toEqual({ username: 'admin', password: 'secret' });
    });

    it.each([
        ['the username field', usernameInput],
        ['the password field', passwordInput],
        ['the button', () => buttonOf(ENTER)],
    ])('logs in when Enter is pressed in %s', async (_name, element) => {
        backend.post('/public/user/login', {});
        renderPage();
        enterCredentials('admin', 'secret');

        fireEvent.keyDown(element(), { key: 'Enter' });

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
    });

    it('shows the error and keeps the input when the credentials are wrong', async () => {
        backend.fail('POST', '/public/user/login', 401);
        renderPage();

        enterCredentials('admin', 'falsch');
        fireEvent.click(screen.getByText(ENTER));

        await expectErrorToast('Nutzername oder Passwort ist falsch');
        expect(currentPath()).toBe('/admin/login');
        expect(usernameInput()).toHaveValue('admin');
    });

    it('shows a generic error when the login fails for another reason', async () => {
        backend.networkError('POST', '/public/user/login');
        renderPage();

        fireEvent.click(screen.getByText(ENTER));

        await expectErrorToast('Login fehlgeschlagen');
    });

    it.each([
        ['click', (link: HTMLElement) => fireEvent.click(link)],
        ['Enter key', (link: HTMLElement) => fireEvent.keyDown(link, { key: 'Enter' })],
        ['space key', (link: HTMLElement) => fireEvent.keyDown(link, { key: ' ' })],
    ])('links back to the team login (%s)', (_name, activate) => {
        renderPage();

        activate(screen.getByText('Zurück zum Team Login'));

        expect(currentPath()).toBe('/login');
    });
});

describe('admin Dashboard', () => {
    const renderPage = () => renderWithRouter(<Dashboard />, { route: '/admin/dashboard' });

    /** Resolves once the dashboard has applied the schedule state it loaded. */
    const waitForDashboard = () => waitFor(() => expect(backend.requestsTo('GET', '/public/schedule/rounds/unplayed')).toHaveLength(1))
        .then(() => screen.findByText('Teams'));

    const ALWAYS = ['Teams', 'Umfragen', 'Kontrollzentrum', 'Logout'];

    beforeEach(() => {
        stubDefaultBackend();
    });

    itRequiresAnAdminSession(renderPage);

    it.each([
        ['before the schedule exists', { schedule: false, finalSchedule: false, unplayed: 0 }, ['Spielplan erzeugen'], ['Punkte eintragen', 'Finalspiele erzeugen', 'Zwischenergebnis', 'Endergebnis']],
        ['during the group phase', { schedule: true, finalSchedule: false, unplayed: 3 }, ['Punkte eintragen'], ['Spielplan erzeugen', 'Finalspiele erzeugen', 'Zwischenergebnis', 'Endergebnis']],
        ['after the group phase', { schedule: true, finalSchedule: false, unplayed: 0 }, ['Punkte eintragen', 'Finalspiele erzeugen', 'Zwischenergebnis'], ['Spielplan erzeugen', 'Endergebnis']],
        ['while the finals are played', { schedule: true, finalSchedule: true, unplayed: 2 }, ['Punkte eintragen'], ['Spielplan erzeugen', 'Finalspiele erzeugen', 'Zwischenergebnis', 'Endergebnis']],
        ['after the finals', { schedule: true, finalSchedule: true, unplayed: 0 }, ['Punkte eintragen', 'Endergebnis'], ['Spielplan erzeugen', 'Finalspiele erzeugen', 'Zwischenergebnis']],
    ])('offers the matching actions %s', async (_phase, state, offered, hidden) => {
        stubScheduleState(state);

        renderPage();

        for (const label of offered) {
            expect(await screen.findByText(label)).toBeInTheDocument();
        }
        hidden.forEach(label => expect(screen.queryByText(label)).not.toBeInTheDocument());
        ALWAYS.forEach(label => expect(screen.getByText(label)).toBeInTheDocument());
    });

    it.each([
        ['Punkte eintragen', '/admin/points'],
        ['Finalspiele erzeugen', '/admin/final'],
        ['Zwischenergebnis', '/admin/results'],
        ['Teams', '/admin/teams'],
        ['Umfragen', '/admin/survey'],
        ['Kontrollzentrum', '/admin/control'],
    ])('opens %s at %s', async (label, path) => {
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 0 });
        renderPage();

        fireEvent.click(await screen.findByText(label));

        expect(currentPath()).toBe(path);
    });

    it('opens the schedule creation while no schedule exists', async () => {
        stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });
        renderPage();

        fireEvent.click(await screen.findByText('Spielplan erzeugen'));

        expect(currentPath()).toBe('/admin/schedule');
    });

    it('opens the final result after the finals', async () => {
        stubScheduleState({ schedule: true, finalSchedule: true, unplayed: 0 });
        renderPage();

        fireEvent.click(await screen.findByText('Endergebnis'));

        expect(currentPath()).toBe('/admin/results');
    });

    it('ends the session on logout and returns to the admin login', async () => {
        backend.post('/public/user/logout');
        renderPage();
        await waitForDashboard();

        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => expect(currentPath()).toBe('/admin/login'));
        expect(backend.requestsTo('POST', '/public/user/logout')).toHaveLength(1);
    });

    it('shows an error when the schedule state cannot be loaded', async () => {
        backend.fail('GET', '/public/schedule/create/schedule', 500);

        renderPage();

        await expectErrorToast('Spielplan-Status konnte nicht geladen werden');
    });

    it('shows no error when everything loads', async () => {
        renderPage();
        await waitForDashboard();

        expect(queryToast()).not.toBeInTheDocument();
    });

    it.each([
        ['click', (link: HTMLElement) => fireEvent.click(link)],
        ['Enter key', (link: HTMLElement) => fireEvent.keyDown(link, { key: 'Enter' })],
    ])('links back to the team login (%s)', async (_name, activate) => {
        renderPage();
        await waitForDashboard();

        activate(screen.getByText('Zurück zum Team Login'));

        expect(currentPath()).toBe('/login');
    });
});

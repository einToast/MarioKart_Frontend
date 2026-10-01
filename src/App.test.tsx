import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { backend, stubDefaultBackend, stubLoggedOutAdmin, stubScheduleState } from './test/backend';
import { makeTeams } from './test/fixtures';
import { loginAsTeam } from './test/render';

vi.mock('qrcode.react', () => ({ QRCodeCanvas: () => <canvas data-testid="qr-code" /> }));

/** App uses the browser history, so a test chooses its start page through the address bar. */
const renderAppAt = (path: string) => {
    window.history.pushState({}, '', path);
    return render(<App />);
};

const path = () => window.location.pathname;
const tabs = (container: HTMLElement) => Array.from(container.querySelectorAll('ion-tab-button')).map(tab => tab.getAttribute('tab'));

describe('App', () => {
    beforeEach(() => {
        stubDefaultBackend();
        backend
            .get('/public/teams/sortedByTeamName', makeTeams())
            .get('/public/teams/characters/available', [{ id: 9, characterName: 'Yoshi' }])
            .get('/public/teams/sortedByGroupPoints', makeTeams());
    });

    describe('for a visitor who is not logged in', () => {
        it('opens the team login', async () => {
            renderAppAt('/');

            expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
            expect(path()).toBe('/login');
        });

        it.each(['/tab1', '/tab2', '/survey', '/does-not-exist'])('redirects %s to the team login', async (start) => {
            renderAppAt(start);

            await waitFor(() => expect(path()).toBe('/login'));
        });

        it('offers the registration', async () => {
            renderAppAt('/register');

            expect(await screen.findByRole('heading', { name: 'Register' })).toBeInTheDocument();
            expect(path()).toBe('/register');
        });

        it('shows the how-to-play page without logging in', async () => {
            renderAppAt('/tab4');

            expect(await screen.findByRole('heading', { name: 'So wird gespielt' })).toBeInTheDocument();
        });

        it('shows no tab bar', async () => {
            const { container } = renderAppAt('/login');

            await screen.findByRole('heading', { name: 'Login' });
            expect(container.querySelector('ion-tab-bar')).not.toBeInTheDocument();
        });

        it('answers the health check', async () => {
            renderAppAt('/healthcheck');

            expect(await screen.findByText('OK')).toBeInTheDocument();
        });

        it('loads the admin login on demand', async () => {
            stubLoggedOutAdmin();

            renderAppAt('/admin/login');

            expect(await screen.findByPlaceholderText('Benutzername')).toBeInTheDocument();
            expect(path()).toBe('/admin/login');
        });
    });

    describe('for a logged in team', () => {
        beforeEach(() => {
            loginAsTeam({ teamId: 1, name: 'Team Mario', character: 'Mario' });
        });

        it('opens the schedule', async () => {
            renderAppAt('/');

            expect(await screen.findByRole('heading', { name: 'Spielplan' })).toBeInTheDocument();
            expect(path()).toBe('/tab1');
        });

        it.each(['/login', '/register', '/does-not-exist'])('redirects %s to the schedule', async (start) => {
            renderAppAt(start);

            await waitFor(() => expect(path()).toBe('/tab1'));
        });

        it('shows a tab for the schedule, the ranking, the details and the rules', async () => {
            const { container } = renderAppAt('/tab1');

            await screen.findByRole('heading', { name: 'Spielplan' });
            expect(tabs(container)).toEqual(['tab1', 'tab2', 'tab3', 'tab4']);
        });

        it('removes the ranking tab during the last round of the group phase', async () => {
            stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 1 });

            const { container } = renderAppAt('/tab1');

            await waitFor(() => expect(tabs(container)).toEqual(['tab1', 'tab3', 'tab4']));
        });

        it('keeps the ranking tab when the schedule state cannot be loaded', async () => {
            backend.fail('GET', '/public/schedule/create/schedule', 500);

            const { container } = renderAppAt('/tab4');

            await screen.findByRole('heading', { name: 'So wird gespielt' });
            expect(tabs(container)).toEqual(['tab1', 'tab2', 'tab3', 'tab4']);
        });

        it.each([
            ['/tab2', 'Rangliste'],
            ['/tab3', 'Details'],
            ['/tab4', 'So wird gespielt'],
            ['/survey', 'Abstimmungen'],
        ])('opens %s', async (start, heading) => {
            backend.get('/public/survey/visible', []);

            renderAppAt(start);

            expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
            expect(path()).toBe(start);
        });
    });

    describe('admin area', () => {
        it('opens the dashboard for an admin with a session', async () => {
            renderAppAt('/admin');

            // The first admin route also has to load the lazily imported admin bundle.
            expect(await screen.findByRole('heading', { name: 'Dashboard' }, { timeout: 5000 })).toBeInTheDocument();
            expect(path()).toBe('/admin/dashboard');
        });

        it('redirects unknown admin pages to the dashboard', async () => {
            renderAppAt('/admin/does-not-exist');

            await waitFor(() => expect(path()).toBe('/admin/dashboard'));
        });

        it('is reachable for a logged in team as well', async () => {
            loginAsTeam();

            renderAppAt('/admin/dashboard');

            expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
        });

        it.each([
            ['/admin/teams', 'Teams', '/admin/teams/sortedByFinalPoints'],
            ['/admin/final', 'ACHTUNG!', '/admin/teams/finalTeams'],
        ])('routes %s to its page', async (start, heading, url) => {
            backend.get(url, makeTeams());

            renderAppAt(start);

            expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
        });
    });
});

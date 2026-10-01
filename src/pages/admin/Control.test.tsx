import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend, stubScheduleState } from '../../test/backend';
import { makeBreak, makeRound, makeTeam } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast, queryToast } from '../../test/overlays';
import { buttonOf, currentPath, renderWithRouter } from '../../test/render';
import Control from './Control';

const renderPage = () => renderWithRouter(<Control />, { route: '/admin/control' });

const dialog = () => within(screen.getByRole('dialog'));
// The confirm button of a dialog repeats the dialog title; this is the button
const confirm = (label: string) => fireEvent.click(dialog().getByText(label, { selector: 'p' }));

// The labels of the actions the control centre offers, in order
const actions = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.adminDashboard ion-button')).map(button => button.textContent);

const stubSettings = (settings: { tournamentOpen: boolean; registrationOpen: boolean }) => backend.get('/public/settings', settings);

describe('admin Control', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    // The confirmation dialog reads the public settings as soon as it is mounted
    itRequiresAnAdminSession(renderPage, { unguardedRequests: ['/public/settings'] });

    describe('offered actions', () => {
        it('before the schedule exists', async () => {
            stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });

            const { container } = renderPage();

            await waitFor(() => expect(actions(container)).toEqual([
                'Turnier schließen',
                'Registrierung schließen',
                'Benachrichtigung senden',
                'Alle Teams löschen',
                'Alle Umfragen löschen',
                'Anwendung zurücksetzen',
            ]));
        });

        it('during the group phase', async () => {
            stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 3 });

            const { container } = renderPage();

            await waitFor(() => expect(actions(container)).toEqual([
                'Pause ändern',
                'Turnier schließen',
                'Benachrichtigung senden',
                'Gesamten Spielplan löschen',
                'Alle Umfragen löschen',
                'Anwendung zurücksetzen',
            ]));
        });

        it('once the finals are scheduled', async () => {
            stubScheduleState({ schedule: true, finalSchedule: true, unplayed: 1 });

            const { container } = renderPage();

            await waitFor(() => expect(actions(container)).toEqual([
                'Pause ändern',
                'Turnier schließen',
                'Benachrichtigung senden',
                'Alle Finalspiele löschen',
                'Alle Umfragen löschen',
                'Anwendung zurücksetzen',
            ]));
        });

        it('offers to open a closed tournament and a closed registration', async () => {
            stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });
            stubSettings({ tournamentOpen: false, registrationOpen: false });

            renderPage();

            expect(await screen.findByText('Turnier öffnen')).toBeInTheDocument();
            expect(screen.getByText('Registrierung öffnen')).toBeInTheDocument();
        });
    });

    describe('confirmed changes', () => {
        it.each([
            ['Alle Teams löschen', { schedule: false, finalSchedule: false, unplayed: 0 }, 'Teams löschen', '/admin/teams', 'Alle Teams wurden gelöscht'],
            ['Gesamten Spielplan löschen', { schedule: true, finalSchedule: false, unplayed: 3 }, 'Spielplan löschen', '/admin/schedule/create/schedule', 'Der Spielplan wurde gelöscht'],
            ['Alle Finalspiele löschen', { schedule: true, finalSchedule: true, unplayed: 1 }, 'Finalspiele löschen', '/admin/schedule/create/final_schedule', 'Alle Finalspiele wurden gelöscht'],
            ['Anwendung zurücksetzen', { schedule: true, finalSchedule: false, unplayed: 3 }, 'Anwendung zurücksetzen', '/admin/settings/reset', 'Die Anwendung wurde zurückgesetzt'],
        ])('"%s" asks for confirmation, deletes and confirms', async (action, state, title, url, message) => {
            stubScheduleState(state);
            backend.delete(url);
            const { container } = renderPage();
            await waitFor(() => expect(actions(container)).toContain(action));

            fireEvent.click(within(container.querySelector('.adminDashboard') as HTMLElement).getByText(action));
            expect(dialog().getByRole('heading')).toHaveTextContent(title);
            confirm(title);

            await expectSuccessToast(message);
            expect(backend.requestsTo('DELETE', url)).toHaveLength(1);
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        });

        it('deletes all surveys and confirms', async () => {
            backend.get('/admin/survey', []);
            renderPage();

            fireEvent.click(await screen.findByText('Alle Umfragen löschen'));
            confirm('Umfragen löschen');

            await expectSuccessToast('Alle Umfragen wurden gelöscht');
        });

        it('closes the open tournament and confirms', async () => {
            backend.put('/admin/settings', {});
            renderPage();

            fireEvent.click(await screen.findByText('Turnier schließen'));
            confirm('Turnier schließen');

            await expectSuccessToast('Das Turnier wurde geschlossen');
            expect(backend.requestsTo('PUT', '/admin/settings')[0].body).toEqual({ tournamentOpen: false });
        });

        it('opens the closed registration and confirms', async () => {
            stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });
            stubSettings({ tournamentOpen: true, registrationOpen: false });
            backend.put('/admin/settings', {});
            renderPage();

            fireEvent.click(await screen.findByText('Registrierung öffnen'));
            confirm('Registrierung öffnen');

            await expectSuccessToast('Die Registrierung wurde geöffnet');
            expect(backend.requestsTo('PUT', '/admin/settings')[0].body).toEqual({ registrationOpen: true });
        });

        it('reloads the state after a change so the offered actions stay correct', async () => {
            backend.put('/admin/settings', {});
            renderPage();
            fireEvent.click(await screen.findByText('Turnier schließen'));
            stubSettings({ tournamentOpen: false, registrationOpen: true });

            confirm('Turnier schließen');

            expect(await screen.findByText('Turnier öffnen')).toBeInTheDocument();
        });

        it('shows the error inside the dialog and changes nothing when the change fails', async () => {
            stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });
            backend.fail('DELETE', '/admin/teams', 409);
            renderPage();

            fireEvent.click(await screen.findByText('Alle Teams löschen'));
            confirm('Teams löschen');

            await expectErrorToast('Spielplan wurde bereits erstellt');
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('closes the dialog without a confirmation message on cancel', async () => {
            renderPage();
            fireEvent.click(await screen.findByText('Anwendung zurücksetzen'));

            fireEvent.click(dialog().getByText('Abbrechen'));

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(queryToast()).not.toBeInTheDocument();
            expect(backend.requests.filter(request => request.method !== 'GET')).toEqual([]);
        });

        it.each(['Enter', ' '])('opens a confirmation with the "%s" key', async (key) => {
            renderPage();
            await screen.findByText('Anwendung zurücksetzen');

            fireEvent.keyDown(buttonOf('Anwendung zurücksetzen'), { key });

            expect(dialog().getByRole('heading')).toHaveTextContent('Anwendung zurücksetzen');
        });
    });

    describe('break', () => {
        const stubBreak = () => backend
            .get('/admin/schedule/break', makeBreak({ startTime: '2025-01-08T18:30:00', endTime: '2025-01-08T19:00:00', round: makeRound({ id: 6, roundNumber: 6 }) }))
            .get('/admin/schedule/rounds', [makeRound({ id: 5, roundNumber: 5 }), makeRound({ id: 6, roundNumber: 6 })]);

        it('opens the break editor with the current break', async () => {
            stubBreak();
            renderPage();

            fireEvent.click(await screen.findByText('Pause ändern'));

            await waitFor(() => expect(screen.getByPlaceholderText('Dauer der Pause')).toHaveValue(30));
        });

        it('saves the edited break and confirms', async () => {
            stubBreak();
            backend.put('/admin/schedule/break', makeBreak());
            renderPage();
            fireEvent.click(await screen.findByText('Pause ändern'));
            await waitFor(() => expect(screen.getByPlaceholderText('Dauer der Pause')).toHaveValue(30));
            fireEvent.change(screen.getByPlaceholderText('Dauer der Pause'), { target: { value: '15' } });

            confirm('Pause ändern');

            await expectSuccessToast('Die Pause wurde geändert');
            expect(backend.requestsTo('PUT', '/admin/schedule/break')[0].body).toEqual({ roundId: 6, breakDuration: 15, breakEnded: false });
        });

        it('shows an error instead of the editor when the break cannot be loaded', async () => {
            backend.fail('GET', '/admin/schedule/break', 500);
            renderPage();

            fireEvent.click(await screen.findByText('Pause ändern'));

            await expectErrorToast('Pause konnte nicht geladen werden');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('notifications', () => {
        const stubTeams = () => backend.get('/admin/teams/sortedByFinalPoints', [
            makeTeam({ id: 3, teamName: 'Team Peach' }),
            makeTeam({ id: 1, teamName: 'Team Mario' }),
            makeTeam({ id: 2, teamName: 'Team Luigi' }),
        ]);

        it('offers the teams as recipients in alphabetical order', async () => {
            stubTeams();
            renderPage();

            fireEvent.click(await screen.findByText('Benachrichtigung senden'));

            await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
            expect(dialog().getAllByRole('option').map(option => option.textContent)).toEqual([
                'Alle', 'Team Luigi', 'Team Mario', 'Team Peach',
            ]);
        });

        it('sends the notification and confirms', async () => {
            stubTeams();
            backend.post('/admin/notification/send');
            renderPage();
            fireEvent.click(await screen.findByText('Benachrichtigung senden'));
            fireEvent.change(await screen.findByPlaceholderText('Titel eingeben'), { target: { value: 'Pause' } });
            fireEvent.change(screen.getByPlaceholderText('Nachricht eingeben'), { target: { value: 'Pizza ist da' } });

            confirm('Benachrichtigung senden');

            await expectSuccessToast('Benachrichtigung wurde gesendet');
            expect(backend.requestsTo('POST', '/admin/notification/send')[0].body).toEqual({ title: 'Pause', message: 'Pizza ist da' });
        });

        it('shows an error instead of the dialog when the teams cannot be loaded', async () => {
            backend.fail('GET', '/admin/teams/sortedByFinalPoints', 401);
            renderPage();

            fireEvent.click(await screen.findByText('Benachrichtigung senden'));

            await expectErrorToast('Nicht autorisierter Zugriff');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('shows an error when the state cannot be loaded', async () => {
        backend.fail('GET', '/public/settings', 500);

        renderPage();

        await expectErrorToast('Einstellungen konnten nicht geladen werden');
    });

    it.each([
        ['click', (element: HTMLElement) => fireEvent.click(element)],
        ['Enter key', (element: HTMLElement) => fireEvent.keyDown(element, { key: 'Enter' })],
    ])('returns to the dashboard (%s)', async (_name, activate) => {
        renderPage();
        await screen.findByText('Anwendung zurücksetzen');

        activate(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend, stubScheduleState } from '../../test/backend';
import { makeRound, makeTeam, makeTeams } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { buttonOf, currentPath, renderWithRouter } from '../../test/render';
import Final from './Final';
import Schedule from './Schedule';
import Teams from './Teams';

const teamNames = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.teamContainer .stats p:first-child')).map(node => node.textContent);
const row = (teamName: string) => within(screen.getByText(teamName).closest('.teamContainer') as HTMLElement);

describe('admin Final', () => {
    const FINAL_TEAMS_URL = '/admin/teams/finalTeams';
    const RESET_URL = '/admin/teams/finalParticipation/reset';
    const CREATE_URL = '/admin/schedule/create/final_schedule';

    const renderPage = () => renderWithRouter(<Final />, { route: '/admin/final' });

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(FINAL_TEAMS_URL, makeTeams());
    });

    itRequiresAnAdminSession(renderPage);

    it('warns about the consequences and lists the teams that reached the final', async () => {
        const { container } = renderPage();

        expect(screen.getByRole('heading', { name: 'ACHTUNG!' })).toBeInTheDocument();
        await waitFor(() => expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad']));
    });

    it('lets the admin take teams out of the final but not delete them', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        expect(row('Team Mario').getByTitle('Team nicht am Finale teilnehmen lassen')).toBeInTheDocument();
        expect(row('Team Mario').queryByTitle('Team löschen')).not.toBeInTheDocument();
    });

    it('reloads the final teams after a team was taken out of the final', async () => {
        backend.put('/admin/teams/4', makeTeam({ id: 4 }));
        const { container } = renderPage();
        await screen.findByText('Team Toad');
        backend.get(FINAL_TEAMS_URL, makeTeams().slice(0, 3));

        fireEvent.click(row('Team Toad').getByTitle('Team nicht am Finale teilnehmen lassen'));

        await waitFor(() => expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach']));
        expect(backend.requestsTo('PUT', '/admin/teams/4')[0].body).toMatchObject({ finalReady: false });
    });

    it('resets the final participation of every team, confirms and reloads', async () => {
        backend.put(RESET_URL, makeTeams());
        const { container } = renderPage();
        await screen.findByText('Team Mario');
        backend.get(FINAL_TEAMS_URL, makeTeams().slice(0, 2));

        fireEvent.click(screen.getByText('Teams zurücksetzen'));

        await expectSuccessToast('Teams zurückgesetzt');
        await waitFor(() => expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi']));
    });

    it('shows the error when the reset fails', async () => {
        backend.fail('PUT', RESET_URL, 401);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Teams zurücksetzen'));

        await expectErrorToast('Nicht autorisierter Zugriff');
    });

    it('reports an error when the backend answers the reset without teams', async () => {
        backend.put(RESET_URL, undefined);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Teams zurücksetzen'));

        await expectErrorToast('Teams konnten nicht zurückgesetzt werden');
    });

    it('creates the final schedule and returns to the dashboard', async () => {
        backend.post(CREATE_URL, [makeRound({ finalGame: true })]);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Finale erzeugen'));

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
        expect(backend.requestsTo('POST', CREATE_URL)).toHaveLength(1);
    });

    it('shows the error and stays on the page when the final cannot be created yet', async () => {
        backend.fail('POST', CREATE_URL, 400);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Finale erzeugen'));

        await expectErrorToast('Noch nicht alle Runden gespielt');
        expect(currentPath()).toBe('/admin/final');
        await waitFor(() => expect(buttonOf('Finale erzeugen').disabled).toBe(false));
    });

    it('reports an error when the backend answers without the final rounds', async () => {
        backend.post(CREATE_URL, undefined);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Finale erzeugen'));

        await expectErrorToast('Finale konnte nicht erstellt werden');
    });

    it('shows an error when the final teams cannot be loaded', async () => {
        backend.fail('GET', FINAL_TEAMS_URL, 500);

        renderPage();

        await expectErrorToast('Team konnte nicht abgerufen werden');
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});

describe('admin Schedule', () => {
    const TEAMS_URL = '/public/teams/sortedByTeamName';
    const CREATE_URL = '/admin/schedule/create/schedule';
    const CREATE = 'Spielplan erzeugen';

    const renderPage = () => renderWithRouter(<Schedule />, { route: '/admin/schedule' });

    const version = () => screen.getByLabelText('Schedule Version:') as HTMLSelectElement;
    const fields = () => screen.getByLabelText('Anzahl Spielfelder:') as HTMLInputElement;
    const rounds = () => screen.getByLabelText('Anzahl Runden:') as HTMLInputElement;
    const teamsPerGame = () => screen.getByLabelText('Teams pro Spiel:') as HTMLInputElement;
    const set = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(TEAMS_URL, makeTeams());
    });

    itRequiresAnAdminSession(renderPage);

    it('counts and lists the registered teams', async () => {
        const { container } = renderPage();

        expect(await screen.findByText('Anzahl der angemeldeten Teams: 4')).toBeInTheDocument();
        expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad']);
    });

    it('still allows deleting teams, since no schedule exists yet', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        expect(row('Team Mario').getByTitle('Team löschen')).toBeInTheDocument();
    });

    it('proposes schedule version 2 with 4 fields, 8 rounds and 4 teams per game', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        expect(version()).toHaveValue('2');
        expect([fields().value, rounds().value, teamsPerGame().value]).toEqual(['4', '8', '4']);
        expect(fields()).toBeEnabled();
    });

    it('creates the schedule with the entered parameters and returns to the dashboard', async () => {
        backend.post(CREATE_URL, [makeRound()]);
        renderPage();
        await screen.findByText('Team Mario');

        set(fields(), '3');
        set(rounds(), '10');
        set(teamsPerGame(), '2');
        fireEvent.click(screen.getByText(CREATE));

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
        expect(backend.requestsTo('POST', CREATE_URL)[0].body).toEqual({ version: 2, numFields: 3, numRounds: 10, teamsPerGame: 2 });
    });

    it.each(['Enter', ' '])('creates the schedule with the "%s" key', async (key) => {
        backend.post(CREATE_URL, [makeRound()]);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.keyDown(screen.getByText(CREATE).parentElement as HTMLElement, { key });

        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
    });

    it('fixes the parameters of schedule version 1', async () => {
        backend.post(CREATE_URL, [makeRound()]);
        renderPage();
        await screen.findByText('Team Mario');
        set(fields(), '3');
        set(rounds(), '10');

        set(version(), '1');

        expect([fields().value, rounds().value, teamsPerGame().value]).toEqual(['4', '8', '4']);
        expect(fields()).toBeDisabled();
        expect(rounds()).toBeDisabled();
        expect(teamsPerGame()).toBeDisabled();

        fireEvent.click(screen.getByText(CREATE));
        await waitFor(() => expect(backend.requestsTo('POST', CREATE_URL)).toHaveLength(1));
        expect(backend.requestsTo('POST', CREATE_URL)[0].body).toEqual({ version: 1, numFields: 4, numRounds: 8, teamsPerGame: 4 });
    });

    it('allows clearing a number field while typing', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        set(rounds(), '');

        expect(rounds()).toHaveValue(null);
    });

    it('shows the error and stays on the page when there are not enough teams', async () => {
        backend.fail('POST', CREATE_URL, 404);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText(CREATE));

        await expectErrorToast('Nicht genügend Teams vorhanden');
        expect(currentPath()).toBe('/admin/schedule');
        await waitFor(() => expect(buttonOf(CREATE).disabled).toBe(false));
    });

    it('reports an error when the backend answers without the rounds', async () => {
        backend.post(CREATE_URL, undefined);
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText(CREATE));

        await expectErrorToast('Spielplan konnte nicht erstellt werden');
    });

    it('shows an error when the teams cannot be loaded', async () => {
        backend.fail('GET', TEAMS_URL, 500);

        renderPage();

        await expectErrorToast('Teams konnten nicht geladen werden');
        expect(screen.getByText('Anzahl der angemeldeten Teams: 0')).toBeInTheDocument();
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });

    it.todo('refreshes the list after a team was (de)activated (currently the reloaded teams are discarded)');
});

describe('admin Teams', () => {
    const TEAMS_URL = '/admin/teams/sortedByFinalPoints';

    const renderPage = () => renderWithRouter(<Teams />, { route: '/admin/teams' });

    beforeEach(() => {
        stubDefaultBackend();
        stubScheduleState({ schedule: false, finalSchedule: false, unplayed: 0 });
        backend.get(TEAMS_URL, makeTeams());
    });

    itRequiresAnAdminSession(renderPage);

    it('counts and lists the registered teams', async () => {
        const { container } = renderPage();

        expect(await screen.findByText('Anzahl der angemeldeten Teams: 4')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Teams' })).toBeInTheDocument();
        expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad']);
    });

    it('offers every team action before the schedule exists', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        expect(row('Team Mario').getByTitle('Team bearbeiten')).toBeInTheDocument();
        expect(row('Team Mario').getByTitle('Team deaktivieren')).toBeInTheDocument();
        expect(row('Team Mario').getByTitle('Team löschen')).toBeInTheDocument();
    });

    it('does not offer deleting once the schedule exists', async () => {
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 3 });
        renderPage();
        await screen.findByText('Team Mario');

        await waitFor(() => expect(row('Team Mario').queryByTitle('Team löschen')).not.toBeInTheDocument());
        expect(row('Team Mario').getByTitle('Team deaktivieren')).toBeInTheDocument();
    });

    it('only offers editing once the finals are scheduled', async () => {
        stubScheduleState({ schedule: true, finalSchedule: true, unplayed: 1 });
        renderPage();
        await screen.findByText('Team Mario');

        await waitFor(() => expect(row('Team Mario').queryByTitle('Team deaktivieren')).not.toBeInTheDocument());
        expect(row('Team Mario').queryByTitle('Team löschen')).not.toBeInTheDocument();
        expect(row('Team Mario').getByTitle('Team bearbeiten')).toBeInTheDocument();
    });

    it('reloads the teams after a team was deactivated', async () => {
        backend.put('/admin/teams/1', makeTeam());
        renderPage();
        await screen.findByText('Team Mario');
        backend.get(TEAMS_URL, makeTeams().map(team => (team.id === 1 ? { ...team, active: false, finalReady: false } : team)));

        fireEvent.click(row('Team Mario').getByTitle('Team deaktivieren'));

        expect(await row('Team Mario').findByTitle('Team aktivieren')).toBeInTheDocument();
    });

    it('reloads the teams after a team was deleted', async () => {
        backend.delete('/admin/teams/4');
        const { container } = renderPage();
        await screen.findByText('Team Toad');
        backend.get(TEAMS_URL, makeTeams().slice(0, 3));

        fireEvent.click(row('Team Toad').getByTitle('Team löschen'));
        fireEvent.click(within(screen.getByRole('dialog')).getByText('Team löschen', { selector: 'p' }));

        await expectSuccessToast('Team wurde entfernt');
        await waitFor(() => expect(teamNames(container)).toEqual(['Team Mario', 'Team Luigi', 'Team Peach']));
        expect(screen.getByText('Anzahl der angemeldeten Teams: 3')).toBeInTheDocument();
    });

    it('shows an error when the teams cannot be loaded', async () => {
        backend.fail('GET', TEAMS_URL, 500);

        renderPage();

        await expectErrorToast('Teams konnten nicht abgerufen werden');
    });

    it('shows an error when the schedule state cannot be loaded', async () => {
        backend.fail('GET', '/public/schedule/create/schedule', 500);

        renderPage();

        await expectErrorToast('Spielplan-Status konnte nicht geladen werden');
    });

    it('returns to the dashboard', async () => {
        renderPage();
        await screen.findByText('Team Mario');

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });
});

import { fireEvent, screen, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { backend, stubDefaultBackend } from '../test/backend';
import { makeTeam, makeTeams } from '../test/fixtures';
import { expectErrorToast, queryToast } from '../test/overlays';
import { buttonOf, currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import LoginTeam from './LoginTeam';
import RegisterTeam from './RegisterTeam';

const TEAMS_URL = '/public/teams/sortedByTeamName';
const CHARACTERS_URL = '/public/teams/characters/available';

describe('LoginTeam', () => {
    const renderPage = () => {
        const setUser = vi.fn();
        const view = renderWithRouter(<LoginTeam setUser={setUser} />, { route: '/login' });
        return { ...view, setUser };
    };

    const teamSelect = () => screen.getByRole('combobox') as HTMLSelectElement;
    const teamOptions = () => Array.from(teamSelect().options).map(option => option.textContent);
    const waitForTeams = () => waitFor(() => expect(teamOptions()).toContain('Team Mario'));

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(TEAMS_URL, makeTeams());
    });

    it('offers every registered team', async () => {
        renderPage();

        await waitFor(() => expect(teamOptions()).toEqual(['Select Team', 'Team Mario', 'Team Luigi', 'Team Peach', 'Team Toad']));
        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    it('shows the character of the selected team and names the team on the button', async () => {
        renderPage();
        await waitForTeams();

        fireEvent.change(teamSelect(), { target: { value: '3' } });

        expect(screen.getByAltText('Peach character')).toHaveAttribute('src', '/characters/Peach.png');
        expect(screen.getByText('Zum Team Team Peach anmelden')).toBeInTheDocument();
    });

    it('logs the selected team in and opens the schedule', async () => {
        const { setUser } = renderPage();
        await waitForTeams();

        fireEvent.change(teamSelect(), { target: { value: '3' } });
        fireEvent.click(screen.getByText('Zum Team Team Peach anmelden'));

        const user = { character: 'Peach', teamId: 3, name: 'Team Peach' };
        expect(setUser).toHaveBeenCalledWith(user);
        expect(JSON.parse(Cookies.get('user') as string)).toEqual(user);
        expect(currentPath()).toBe('/tab1');
    });

    it.each(['Enter', ' '])('logs in with the "%s" key', async (key) => {
        const { setUser } = renderPage();
        await waitForTeams();

        fireEvent.change(teamSelect(), { target: { value: '2' } });
        fireEvent.keyDown(buttonOf('Zum Team Team Luigi anmelden'), { key });

        expect(setUser).toHaveBeenCalledWith({ character: 'Luigi', teamId: 2, name: 'Team Luigi' });
    });

    it('asks for a team when none is selected', async () => {
        const { setUser } = renderPage();
        await waitForTeams();

        fireEvent.click(screen.getByText(/^Zum Team\s+anmelden$/));

        await expectErrorToast('Ausgewähltes Team nicht in der Liste gefunden.');
        expect(setUser).not.toHaveBeenCalled();
        expect(currentPath()).toBe('/login');
    });

    it('skips the login for a team that is already logged in', async () => {
        loginAsTeam();

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/tab1'));
    });

    it('sends visitors to the admin login while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin/login'));
    });

    it('stays on the login while the tournament is open', async () => {
        renderPage();

        await waitForTeams();
        expect(currentPath()).toBe('/login');
        expect(queryToast()).not.toBeInTheDocument();
    });

    it('shows an error when the teams cannot be loaded', async () => {
        backend.fail('GET', TEAMS_URL, 500);

        renderPage();

        await expectErrorToast('Teams konnten nicht geladen werden');
    });

    it('shows an error when the tournament state cannot be loaded', async () => {
        backend.fail('GET', '/public/settings', 500);

        renderPage();

        await expectErrorToast('Einstellungen konnten nicht geladen werden');
    });

    it('reloads the teams on pull-to-refresh', async () => {
        const { container } = renderPage();
        await waitForTeams();
        backend.get(TEAMS_URL, [...makeTeams(), makeTeam({ id: 5, teamName: 'Team Yoshi', character: { id: 5, characterName: 'Yoshi' } })]);

        const complete = pullToRefresh(container);

        await waitFor(() => expect(teamOptions()).toContain('Team Yoshi'));
        expect(complete).toHaveBeenCalledTimes(1);
    });
});

describe('RegisterTeam', () => {
    const REGISTER = 'Team registrieren';

    const renderPage = () => {
        const setUser = vi.fn();
        const view = renderWithRouter(<RegisterTeam setUser={setUser} />, { route: '/register' });
        return { ...view, setUser };
    };

    const characterSelect = () => screen.getByRole('combobox') as HTMLSelectElement;
    const characterOptions = () => Array.from(characterSelect().options).map(option => option.textContent?.trim());
    const nameInput = () => screen.getByPlaceholderText('Teamname');
    const waitForCharacters = () => waitFor(() => expect(characterOptions()).toContain('Yoshi'));
    const fillForm = async (name: string, character: string) => {
        await waitForCharacters();
        fireEvent.change(characterSelect(), { target: { value: character } });
        fireEvent.change(nameInput(), { target: { value: name } });
    };

    const createdTeam = makeTeam({ id: 9, teamName: 'Die Dinos', character: { id: 42, characterName: 'Yoshi' } });

    beforeEach(() => {
        stubDefaultBackend();
        backend.get(CHARACTERS_URL, [{ id: 42, characterName: 'Yoshi' }, { id: 43, characterName: 'Wario' }]);
    });

    it('offers the characters that are still free', async () => {
        renderPage();

        await waitFor(() => expect(characterOptions()).toEqual(['Wähle deinen Charakter', 'Yoshi', 'Wario']));
        expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
        expect(screen.queryByAltText(/character$/)).not.toBeInTheDocument();
    });

    it('shows the selected character', async () => {
        renderPage();
        await waitForCharacters();

        fireEvent.change(characterSelect(), { target: { value: 'Wario' } });

        expect(screen.getByAltText('Wario character')).toHaveAttribute('src', '/characters/Wario.png');
    });

    it('registers the team, logs it in and opens the schedule', async () => {
        backend.post('/public/teams', createdTeam);
        const { setUser } = renderPage();
        await fillForm('Die Dinos', 'Yoshi');

        fireEvent.click(screen.getByText(REGISTER));

        const user = { name: 'Die Dinos', character: 'Yoshi', teamId: 9 };
        await waitFor(() => expect(setUser).toHaveBeenCalledWith(user));
        expect(backend.requestsTo('POST', '/public/teams')[0].body).toEqual({
            teamName: 'Die Dinos', characterName: 'Yoshi', finalReady: true, active: true,
        });
        expect(JSON.parse(Cookies.get('user') as string)).toEqual(user);
        expect(currentPath()).toBe('/tab1');
    });

    it('registers when Enter is pressed in the name field', async () => {
        backend.post('/public/teams', createdTeam);
        const { setUser } = renderPage();
        await fillForm('Die Dinos', 'Yoshi');

        fireEvent.keyPress(nameInput(), { key: 'Enter', charCode: 13 });

        await waitFor(() => expect(setUser).toHaveBeenCalled());
    });

    it.each(['Enter', ' '])('registers with the "%s" key on the button', async (key) => {
        backend.post('/public/teams', createdTeam);
        const { setUser } = renderPage();
        await fillForm('Die Dinos', 'Yoshi');

        fireEvent.keyDown(buttonOf(REGISTER), { key });

        await waitFor(() => expect(setUser).toHaveBeenCalled());
    });

    it('asks for a team name', async () => {
        const { setUser } = renderPage();
        await waitForCharacters();
        fireEvent.change(characterSelect(), { target: { value: 'Yoshi' } });

        fireEvent.click(screen.getByText(REGISTER));

        await expectErrorToast('Der Teamname darf nicht leer sein!');
        expect(setUser).not.toHaveBeenCalled();
        expect(backend.requestsTo('POST', '/public/teams')).toEqual([]);
    });

    it('asks for a character', async () => {
        renderPage();
        await waitForCharacters();
        fireEvent.change(nameInput(), { target: { value: 'Die Dinos' } });

        fireEvent.click(screen.getByText(REGISTER));

        await expectErrorToast('Der Charakter darf nicht leer sein!');
    });

    it('shows the error and refreshes the free characters when the character was taken meanwhile', async () => {
        backend.fail('POST', '/public/teams', 400);
        const { setUser } = renderPage();
        await fillForm('Die Dinos', 'Yoshi');
        backend.get(CHARACTERS_URL, [{ id: 43, characterName: 'Wario' }]);

        fireEvent.click(screen.getByText(REGISTER));

        await expectErrorToast('Charakter schon registriert');
        await waitFor(() => expect(characterOptions()).toEqual(['Wähle deinen Charakter', 'Wario']));
        expect(setUser).not.toHaveBeenCalled();
        expect(currentPath()).toBe('/register');
    });

    it('reports an error when the backend answers without the registered team', async () => {
        backend.post('/public/teams', undefined);
        renderPage();
        await fillForm('Die Dinos', 'Yoshi');

        fireEvent.click(screen.getByText(REGISTER));

        await expectErrorToast('Team konnte nicht registriert werden');
    });

    it('sends visitors to the team login while the registration is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: true, registrationOpen: false });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/login'));
    });

    it('sends visitors to the admin login while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false, registrationOpen: true });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin/login'));
    });

    it('shows an error when the characters cannot be loaded', async () => {
        backend.fail('GET', CHARACTERS_URL, 500);

        renderPage();

        await expectErrorToast('Charaktere konnten nicht geladen werden');
    });

    it('shows an error when the settings cannot be loaded', async () => {
        backend.fail('GET', '/public/settings', 404);

        renderPage();

        await expectErrorToast('Einstellungen nicht gefunden');
    });

    it.each([
        ['click', (link: HTMLElement) => fireEvent.click(link)],
        ['Enter key', (link: HTMLElement) => fireEvent.keyDown(link, { key: 'Enter' })],
        ['space key', (link: HTMLElement) => fireEvent.keyDown(link, { key: ' ' })],
    ])('links to the team login (%s)', async (_name, activate) => {
        renderPage();
        await waitForCharacters();

        activate(screen.getByText('registriertem Team beitreten'));

        expect(currentPath()).toBe('/login');
    });

    it('reloads the free characters on pull-to-refresh', async () => {
        const { container } = renderPage();
        await waitForCharacters();
        backend.get(CHARACTERS_URL, [{ id: 44, characterName: 'Toadette' }]);

        const complete = pullToRefresh(container);

        await waitFor(() => expect(characterOptions()).toEqual(['Wähle deinen Charakter', 'Toadette']));
        expect(complete).toHaveBeenCalledTimes(1);
    });
});

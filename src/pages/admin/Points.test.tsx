import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend } from '../../test/backend';
import { makeGame, makePoints, makeRound, makeTeams } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast } from '../../test/overlays';
import { buttonOf, currentPath, renderWithRouter } from '../../test/render';
import { RoundReturnDTO } from '../../util/api/config/dto';
import Points from './Points';

const ROUNDS_URL = '/admin/schedule/rounds';
const SAVE = 'Punkte speichern';

const renderPage = () => renderWithRouter(<Points />, { route: '/admin/points' });

// A round with a blue (id 2) and a red (id 1) game, deliberately listed out of order
const roundWithGames = (overrides: Partial<RoundReturnDTO>): RoundReturnDTO => {
    const teams = makeTeams();
    return makeRound({
        games: [
            makeGame({ id: 2, switchGame: 'Blau', teams: makeTeams(), points: makeTeams().map(team => makePoints(team, 0)) }),
            makeGame({ id: 1, switchGame: 'Rot', teams: [...teams].reverse(), points: teams.map((team, index) => makePoints(team, 15 - 3 * index)) }),
        ],
        ...overrides,
    });
};

// Round ids equal round numbers in these fixtures: the page currently looks a selected round up
// by its number (see the todo at the end of this file)
const stubRounds = () => {
    const rounds = [
        roundWithGames({ id: 3, roundNumber: 3, finalGame: true, played: false, startTime: '2025-01-08T20:00:00', endTime: '2025-01-08T20:20:00' }),
        roundWithGames({ id: 1, roundNumber: 1, played: true, startTime: '2025-01-08T16:45:00', endTime: '2025-01-08T17:05:00' }),
        roundWithGames({ id: 2, roundNumber: 2, played: false, startTime: '2025-01-08T17:10:00', endTime: '2025-01-08T17:30:00' }),
    ];
    backend.get(ROUNDS_URL, rounds);
    rounds.forEach(round => backend.get(`${ROUNDS_URL}/${round.id}`, round));
    return rounds;
};

const roundSelect = () => screen.getByRole('combobox') as HTMLSelectElement;
const playedCheckbox = (container: HTMLElement) => container.querySelector('ion-checkbox') as HTMLIonCheckboxElement;
const timeStamp = (container: HTMLElement) => container.querySelector('.timeStamp')?.textContent;
const gameTitles = () => screen.queryAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
const waitForRound = (container: HTMLElement, time: string) => waitFor(() => expect(timeStamp(container)).toBe(time));

describe('admin Points', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    itRequiresAnAdminSession(renderPage);

    it('offers the rounds in playing order and names final rounds separately', async () => {
        stubRounds();

        renderPage();

        await waitFor(() => expect(Array.from(roundSelect().options).map(option => option.textContent)).toEqual(['Runde 1', 'Runde 2', 'Finale 1']));
    });

    it('opens the first round that has not been played yet', async () => {
        stubRounds();

        const { container } = renderPage();

        await waitForRound(container, '17:10 - 17:30');
        expect(roundSelect()).toHaveValue('2');
        expect(playedCheckbox(container).checked).toBe(false);
    });

    it('opens the last round when every round has been played', async () => {
        const rounds = [
            roundWithGames({ id: 1, roundNumber: 1, played: true, startTime: '2025-01-08T16:45:00', endTime: '2025-01-08T17:05:00' }),
            roundWithGames({ id: 2, roundNumber: 2, played: true, startTime: '2025-01-08T17:10:00', endTime: '2025-01-08T17:30:00' }),
        ];
        backend.get(ROUNDS_URL, rounds).get(`${ROUNDS_URL}/2`, rounds[1]);

        const { container } = renderPage();

        await waitForRound(container, '17:10 - 17:30');
        expect(playedCheckbox(container).checked).toBe(true);
    });

    it('lists the games of the round by game id with the points of each team by team id', async () => {
        stubRounds();

        const { container } = renderPage();

        await waitForRound(container, '17:10 - 17:30');
        expect(gameTitles()).toEqual(['Switch Rot', 'Switch Blau']);
        const points = (screen.getAllByRole('spinbutton') as HTMLInputElement[]).map(input => input.value);
        expect(points).toEqual(['15', '12', '9', '6', '0', '0', '0', '0']);
    });

    it('loads another round when it is selected', async () => {
        stubRounds();
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.change(roundSelect(), { target: { value: '1' } });

        await waitForRound(container, '16:45 - 17:05');
        expect(playedCheckbox(container).checked).toBe(true);
    });

    it('saves the round with all points in one request and confirms', async () => {
        const rounds = stubRounds();
        backend.put(`${ROUNDS_URL}/2/full`, rounds[2]);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '11' } });
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Runde erfolgreich gespeichert');
        const body = backend.requestsTo('PUT', `${ROUNDS_URL}/2/full`)[0].body as { played: boolean; games: { id: number; points: { points: number }[] }[] };
        expect(body.played).toBe(false);
        expect(body.games.map(game => game.id)).toEqual([1, 2]);
        expect(body.games[0].points.map(entry => entry.points)).toEqual([11, 12, 9, 6]);
    });

    it('marks the round as played when the checkbox is ticked before saving', async () => {
        const rounds = stubRounds();
        backend.put(`${ROUNDS_URL}/2/full`, rounds[2]);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent(playedCheckbox(container), new CustomEvent('ionChange', { detail: { checked: true } }));
        fireEvent.click(screen.getByText(SAVE));

        await expectSuccessToast('Runde erfolgreich gespeichert');
        expect(backend.requestsTo('PUT', `${ROUNDS_URL}/2/full`)[0].body).toMatchObject({ played: true });
        expect(playedCheckbox(container).checked).toBe(true);
    });

    it.each(['Enter', ' '])('saves with the "%s" key', async (key) => {
        const rounds = stubRounds();
        backend.put(`${ROUNDS_URL}/2/full`, rounds[2]);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.keyDown(buttonOf(SAVE), { key });

        await expectSuccessToast('Runde erfolgreich gespeichert');
    });

    it('shows the error when the round cannot be saved because the break is still running', async () => {
        stubRounds();
        backend.fail('PUT', `${ROUNDS_URL}/2/full`, 409);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Pause wurde noch nicht beendet');
    });

    it('reports an error when the backend answers without the saved round', async () => {
        stubRounds();
        backend.put(`${ROUNDS_URL}/2/full`, undefined);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.click(screen.getByText(SAVE));

        await expectErrorToast('Runde konnte nicht gespeichert werden');
    });

    it('saves a single game from its own save button', async () => {
        const rounds = stubRounds();
        backend.put('/admin/schedule/games/1', rounds[2].games[1]);
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.click(screen.getAllByText('Spiel speichern')[0]);

        await expectSuccessToast('Spiel erfolgreich gespeichert');
        expect(backend.requestsTo('PUT', '/admin/schedule/games/1')).toHaveLength(1);
    });

    it('shows an error when the rounds cannot be loaded', async () => {
        backend.fail('GET', ROUNDS_URL, 500);

        renderPage();

        await expectErrorToast('Runden konnten nicht geladen werden');
    });

    it('returns to the dashboard', async () => {
        stubRounds();
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');

        fireEvent.click(screen.getByText('Zurück'));

        expect(currentPath()).toBe('/admin/dashboard');
    });

    it.todo('loads the selected round by its id (currently the round number is sent as the id)');
    it.todo('explains that no rounds exist yet (currently shows a raw TypeError message)');
});

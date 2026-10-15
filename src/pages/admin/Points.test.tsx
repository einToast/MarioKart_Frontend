import { fireEvent, screen, waitFor } from '@testing-library/react';
import { itRequiresAnAdminSession } from '../../test/adminGuard';
import { backend, stubDefaultBackend } from '../../test/backend';
import { makeGame, makePoints, makeRound, makeSwitches, makeTeams } from '../../test/fixtures';
import { expectErrorToast, expectSuccessToast, queryToast } from '../../test/overlays';
import { buttonOf, currentPath, renderWithRouter } from '../../test/render';
import { RoundReturnDTO } from '../../util/api/config/dto';
import { AdminOcrService } from '../../util/service';
import Points from './Points';

const ROUNDS_URL = '/admin/schedule/rounds';
const SAVE = 'Punkte speichern';

const renderPage = () => renderWithRouter(<Points />, { route: '/admin/points' });

// A round with a blue (id 2) and a red (id 1) game, deliberately listed out of order
const roundWithGames = (overrides: Partial<RoundReturnDTO>): RoundReturnDTO => {
    const teams = makeTeams();
    return makeRound({
        games: [
            makeGame({ id: 2, switchIndex: 0, teams: makeTeams(), points: makeTeams().map(team => makePoints(team, 0)) }),
            makeGame({ id: 1, switchIndex: 1, teams: [...teams].reverse(), points: teams.map((team, index) => makePoints(team, 15 - 3 * index)) }),
        ],
        ...overrides,
    });
};

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
        backend.get('/admin/ocr/available', []);
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

    describe('with point detection', () => {
        const providerSelect = () => screen.getByLabelText('Punkteerkennung:') as HTMLSelectElement;
        const photo = new File(['image'], 'result.jpg', { type: 'image/jpeg' });

        beforeEach(() => {
            // jsdom has no object URLs
            URL.createObjectURL = vi.fn(() => 'blob:photo');
            URL.revokeObjectURL = vi.fn();
            AdminOcrService.clearGamePhotos();
        });

        it('offers the available providers and a photo for every game', async () => {
            stubRounds();
            backend.get('/admin/ocr/available', ['gemini', 'openai']);

            const { container } = renderPage();

            await waitForRound(container, '17:10 - 17:30');
            await waitFor(() => expect(Array.from(providerSelect().options).map(option => option.textContent)).toEqual(['gemini', 'openai']));
            expect(providerSelect()).toHaveValue('gemini');
            expect(screen.getAllByText('Foto auswählen')).toHaveLength(2);
        });

        it('selects the standard provider and marks it', async () => {
            stubRounds();
            backend
                .get('/admin/ocr/available', ['gemini', 'openai'])
                .get('/public/settings', { switches: makeSwitches(), ocrProvider: 'openai' });

            renderPage();

            await waitFor(() => expect(providerSelect()).toHaveValue('openai'));
            expect(Array.from(providerSelect().options).map(option => option.textContent)).toEqual(['gemini', 'openai (Standard)']);
        });

        it('selects the first provider when the standard provider is not available', async () => {
            stubRounds();
            backend
                .get('/admin/ocr/available', ['gemini', 'openai'])
                .get('/public/settings', { switches: makeSwitches(), ocrProvider: 'mistral' });

            renderPage();

            await waitFor(() => expect(providerSelect().options).toHaveLength(2));
            expect(providerSelect()).toHaveValue('gemini');
        });

        it('opens the game a photo is dropped on', async () => {
            stubRounds();
            backend.get('/admin/ocr/available', ['gemini']);
            const { container } = renderPage();
            await waitForRound(container, '17:10 - 17:30');
            await screen.findAllByText('Foto auswählen');
            const games = container.querySelector('ion-accordion-group') as HTMLIonAccordionGroupElement;

            fireEvent.drop(container.querySelectorAll('ion-accordion')[0], { dataTransfer: { types: ['Files'], files: [photo] } });

            expect(screen.getByAltText('Ergebnis von Switch Rot')).toHaveAttribute('src', 'blob:photo');
            expect(games.value).toBe('1');
        });

        it('enters the points read from the photo with the selected provider', async () => {
            stubRounds();
            backend
                .get('/admin/ocr/available', ['gemini', 'openai'])
                .post('/admin/ocr/2/1', { characters: [{ name: 'Toad', points: 1 }, { name: 'Peach', points: 2 }, { name: 'Luigi', points: 3 }, { name: 'Mario', points: 4 }] });
            const { container } = renderPage();
            await waitForRound(container, '17:10 - 17:30');
            await waitFor(() => expect(providerSelect().options).toHaveLength(2));

            fireEvent.change(screen.getByLabelText('Foto von Switch Rot'), { target: { files: [photo] } });
            fireEvent.click(screen.getByText('Foto auswerten'));

            await expectSuccessToast('Switch Rot: Punkte erkannt, bitte prüfen und speichern');
            expect(backend.requestsTo('POST', '/admin/ocr/2/1')[0].body).toEqual({ provider: 'gemini', image: 'aW1hZ2U=' });
            const points = (screen.getAllByRole('spinbutton') as HTMLInputElement[]).map(input => input.value);
            expect(points).toEqual(['4', '3', '2', '1', '0', '0', '0', '0']);
        });

        it('keeps a game open when the page renders again', async () => {
            stubRounds();
            backend.get('/admin/ocr/available', ['gemini', 'openai']);
            const { container } = renderPage();
            await waitForRound(container, '17:10 - 17:30');
            await waitFor(() => expect(providerSelect().options).toHaveLength(2));
            const games = container.querySelector('ion-accordion-group') as HTMLIonAccordionGroupElement;

            // Ionic reports the game that was opened with a click
            fireEvent(games, new CustomEvent('ionChange', { detail: { value: '1' } }));
            fireEvent.change(providerSelect(), { target: { value: 'openai' } });

            expect(games.value).toBe('1');
        });

        it('offers no photos when no provider is available', async () => {
            stubRounds();

            const { container } = renderPage();

            await waitForRound(container, '17:10 - 17:30');
            expect(screen.queryByLabelText('Punkteerkennung:')).not.toBeInTheDocument();
            expect(screen.queryByText('Foto auswählen')).not.toBeInTheDocument();
        });

        it('offers no photos and reports no error when the providers cannot be loaded', async () => {
            stubRounds();
            backend.fail('GET', '/admin/ocr/available', 500);
            const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

            const { container } = renderPage();

            await waitForRound(container, '17:10 - 17:30');
            await waitFor(() => expect(logged).toHaveBeenCalled());
            expect(screen.queryByText('Foto auswählen')).not.toBeInTheDocument();
            expect(queryToast()).not.toBeInTheDocument();
        });
    });

    it('loads the selected round by its id when ids and round numbers differ', async () => {
        const rounds = [
            roundWithGames({ id: 11, roundNumber: 1, played: true, startTime: '2025-01-08T16:45:00', endTime: '2025-01-08T17:05:00' }),
            roundWithGames({ id: 12, roundNumber: 2, played: false, startTime: '2025-01-08T17:10:00', endTime: '2025-01-08T17:30:00' }),
        ];
        backend.get(ROUNDS_URL, rounds);
        rounds.forEach(round => backend.get(`${ROUNDS_URL}/${round.id}`, round));
        const { container } = renderPage();
        await waitForRound(container, '17:10 - 17:30');
        expect(roundSelect()).toHaveValue('12');

        fireEvent.change(roundSelect(), { target: { value: '11' } });

        await waitForRound(container, '16:45 - 17:05');
    });
    it.todo('explains that no rounds exist yet (currently shows a raw TypeError message)');
});

import { fireEvent, screen, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { backend, stubDefaultBackend, stubScheduleState } from '../test/backend';
import { makeBreak, makeGame, makeRound, makeTeam } from '../test/fixtures';
import { expectErrorToast } from '../test/overlays';
import { currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import { stompClient } from '../test/stomp';
import Tab1 from './Tab1';

const CURRENT_ROUNDS_URL = '/public/schedule/rounds/current';

const team = (id: number, name: string) => makeTeam({ id, teamName: `Team ${name}`, character: { id, characterName: name } });

/** Round 5: Mario vs Luigi (red) and Peach vs Toad (blue). Round 6: Mario vs Peach (green). */
const stubTwoRounds = () => {
    backend
        .get(CURRENT_ROUNDS_URL, [
            makeRound({
                id: 5,
                startTime: '2025-01-08T17:45:00',
                endTime: '2025-01-08T18:05:00',
                games: [
                    makeGame({ id: 51, switchGame: 'Rot', teams: [team(1, 'Mario'), team(2, 'Luigi')] }),
                    makeGame({ id: 52, switchGame: 'Blau', teams: [team(3, 'Peach'), team(4, 'Toad')] }),
                ],
            }),
            makeRound({
                id: 6,
                startTime: '2025-01-08T18:10:00',
                endTime: '2025-01-08T18:30:00',
                games: [makeGame({ id: 61, switchGame: 'Grün', teams: [team(1, 'Mario'), team(3, 'Peach')] })],
            }),
        ])
        .get('/public/teams/notInRound/5', [])
        .get('/public/teams/notInRound/6', [team(2, 'Luigi'), team(4, 'Toad')]);
};

const renderPage = () => {
    const setShowTab2 = vi.fn();
    const view = renderWithRouter(<Tab1 showTab2={true} setShowTab2={setShowTab2} />, { route: '/tab1' });
    return { ...view, setShowTab2 };
};

const viewSelect = () => screen.getByRole('combobox') as HTMLSelectElement;
const timeStamps = (container: HTMLElement) => Array.from(container.querySelectorAll('.timeStamp')).map(node => node.textContent);

describe('Tab1 (schedule)', () => {
    beforeEach(() => {
        stubDefaultBackend();
        loginAsTeam({ teamId: 2, name: 'Team Luigi', character: 'Luigi' });
    });

    it('shows the current and the next game of the own team with their times', async () => {
        stubTwoRounds();

        const { container } = renderPage();

        expect(screen.getByRole('heading', { name: 'Spielplan' })).toBeInTheDocument();
        await waitFor(() => expect(timeStamps(container)).toEqual(['17:45 - 18:05', '18:10 - 18:30']));
        expect(screen.getByRole('heading', { name: 'Aktuelles Spiel' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Nächstes Spiel' })).toBeInTheDocument();
        expect(screen.getAllByText('Switch Rot')).toHaveLength(2);
        expect(screen.queryByText('Switch Blau')).not.toBeInTheDocument();
    });

    it('shows the own team as pausing in a round it does not play in', async () => {
        stubTwoRounds();

        renderPage();

        expect(await screen.findByText('Pause')).toBeInTheDocument();
        expect(screen.queryByText('Switch Grün')).not.toBeInTheDocument();
    });

    it('shows the logged in team in the header', () => {
        renderPage();

        expect(screen.getByAltText('Luigi')).toBeInTheDocument();
        expect(screen.getByText('Team Luigi')).toBeInTheDocument();
    });

    it('says that no games were found when nothing is scheduled', async () => {
        renderPage();

        await waitFor(() => expect(screen.getAllByText('Keine Spiele gefunden.')).toHaveLength(2));
    });

    it('announces pizza time during a break and shows the round after it as next', async () => {
        backend
            .get(CURRENT_ROUNDS_URL, [{
                ...makeRound({ id: 6, startTime: '2025-01-08T19:00:00', endTime: '2025-01-08T19:20:00', games: [makeGame({ id: 61, teams: [team(2, 'Luigi'), team(3, 'Peach')] })] }),
                breakTime: makeBreak({ startTime: '2025-01-08T18:30:00', endTime: '2025-01-08T19:00:00' }),
            }])
            .get('/public/teams/notInRound/6', []);

        const { container } = renderPage();

        expect(await screen.findByText(/pizza time/)).toBeInTheDocument();
        await waitFor(() => expect(timeStamps(container)).toEqual(['18:30 - 19:00', '19:00 - 19:20']));
        expect(screen.getByText('Team Peach')).toBeInTheDocument();
    });

    describe('view selection', () => {
        it('starts with the own games', () => {
            renderPage();

            expect(viewSelect()).toHaveValue('Deine Spiele');
            expect(document.body).not.toHaveClass('all-games-selected');
        });

        it('shows every game of both rounds after switching to all games', async () => {
            stubTwoRounds();
            const { container } = renderPage();
            await waitFor(() => expect(timeStamps(container)).toHaveLength(2));

            fireEvent.change(viewSelect(), { target: { value: 'Alle Spiele' } });

            expect(screen.getByRole('heading', { name: 'Aktuelle Spiele' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Nächste Spiele' })).toBeInTheDocument();
            expect(screen.getAllByText('Switch Blau')).toHaveLength(2);
            expect(screen.getAllByText('Switch Grün')).toHaveLength(2);
            expect(document.body).toHaveClass('all-games-selected');
        });

        it('remembers the selection', async () => {
            renderPage();

            fireEvent.change(viewSelect(), { target: { value: 'Alle Spiele' } });

            expect(Cookies.get('selectedGamesOption')).toBe('Alle Spiele');
        });

        it('restores a remembered selection', async () => {
            Cookies.set('selectedGamesOption', 'Alle Spiele');

            renderPage();

            await waitFor(() => expect(viewSelect()).toHaveValue('Alle Spiele'));
            expect(document.body).toHaveClass('all-games-selected');
        });
    });

    it('shows an error when the rounds cannot be loaded', async () => {
        backend.fail('GET', CURRENT_ROUNDS_URL, 500);

        renderPage();

        await expectErrorToast('Aktuelle Runden konnten nicht geladen werden');
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

    it('keeps the ranking tab while more rounds are open', async () => {
        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(true));
        expect(setShowTab2).not.toHaveBeenCalledWith(false);
    });

    it('reloads the rounds when the backend announces a change over the WebSocket', async () => {
        renderPage();
        await waitFor(() => expect(screen.getAllByText('Keine Spiele gefunden.')).toHaveLength(2));

        stompClient().simulateConnect();
        await waitFor(() => expect(stompClient().subscribe).toHaveBeenCalledWith('/topic/rounds', expect.any(Function)), { timeout: 2000 });
        stubTwoRounds();
        const onMessage = stompClient().subscribe.mock.calls[0][1] as () => void;
        onMessage();

        expect(await screen.findAllByText('Switch Rot')).toHaveLength(2);
    });

    it('shows placeholders instead of the rounds while reloading on pull-to-refresh', async () => {
        const { container } = renderPage();
        await waitFor(() => expect(screen.getAllByText('Keine Spiele gefunden.')).toHaveLength(2));

        const complete = pullToRefresh(container);

        await waitFor(() => expect(container.querySelectorAll('ion-skeleton-text').length).toBeGreaterThan(0));
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(complete).not.toHaveBeenCalled();

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(container.querySelectorAll('ion-skeleton-text')).toHaveLength(0);
        expect(screen.getAllByText('Keine Spiele gefunden.')).toHaveLength(2);
    });

    it('shows the fresh rounds after pull-to-refresh', async () => {
        const { container } = renderPage();
        await waitFor(() => expect(screen.getAllByText('Keine Spiele gefunden.')).toHaveLength(2));
        stubTwoRounds();

        const complete = pullToRefresh(container);

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(timeStamps(container)).toEqual(['17:45 - 18:05', '18:10 - 18:30']);
    });
});

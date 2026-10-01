import { screen, waitFor } from '@testing-library/react';
import { backend, stubDefaultBackend, stubScheduleState } from '../test/backend';
import { lastBarProps } from '../test/charts';
import { makeTeam } from '../test/fixtures';
import { expectErrorToast } from '../test/overlays';
import { currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import Tab2 from './Tab2';

const RANKING_URL = '/public/teams/sortedByGroupPoints';

const ranking = () => [
    makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' }, groupPoints: 45, numberOfGamesPlayed: 4 }),
    makeTeam({ id: 1, teamName: 'Team Mario', character: { id: 1, characterName: 'Mario' }, groupPoints: 30, numberOfGamesPlayed: 3 }),
    makeTeam({ id: 3, teamName: 'Team Peach', character: { id: 3, characterName: 'Peach' }, groupPoints: 12, numberOfGamesPlayed: 4 }),
];

const renderPage = (showTab2 = true) => {
    const setShowTab2 = vi.fn();
    const view = renderWithRouter(<Tab2 showTab2={showTab2} setShowTab2={setShowTab2} />, { route: '/tab2' });
    return { ...view, setShowTab2 };
};

const rows = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('.flexContainer > .teamContainer'));

describe('Tab2 (ranking)', () => {
    beforeEach(() => {
        stubDefaultBackend();
        backend.get(RANKING_URL, ranking());
        loginAsTeam({ teamId: 1 });
    });

    it('lists the teams in ranking order with their place and progress during the group phase', async () => {
        const { container } = renderPage();

        expect(screen.getByRole('heading', { name: 'Rangliste' })).toBeInTheDocument();
        await waitFor(() => expect(rows(container)).toHaveLength(3));
        expect(rows(container).map(row => row.textContent)).toEqual([
            'Team Luigi1. Platz4/8 Spiele',
            'Team Mario2. Platz3/8 Spiele',
            'Team Peach3. Platz4/8 Spiele',
        ]);
        expect(rows(container)[1].querySelector('img')).toHaveAttribute('src', '/characters/Mario.png');
    });

    it('keeps the scores secret during the group phase', async () => {
        const { container } = renderPage();

        await waitFor(() => expect(rows(container)).toHaveLength(3));
        expect(screen.queryByText(/Punkte/)).not.toBeInTheDocument();
        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('shows the group points and a chart once the finals are scheduled', async () => {
        stubScheduleState({ schedule: true, finalSchedule: true, unplayed: 0 });

        const { container } = renderPage();

        await waitFor(() => expect(rows(container).map(row => row.textContent)).toEqual([
            'Team Luigi1. Platz45 Punkte',
            'Team Mario2. Platz30 Punkte',
            'Team Peach3. Platz12 Punkte',
        ]));
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(lastBarProps().data.datasets[0].data).toEqual([45, 30, 12]);
    });

    it('highlights the own team', async () => {
        const { container } = renderPage();

        await waitFor(() => expect(rows(container)).toHaveLength(3));
        expect(rows(container).map(row => row.classList.contains('userTeam'))).toEqual([false, true, false]);
    });

    it('shows an error when the ranking cannot be loaded', async () => {
        backend.fail('GET', RANKING_URL, 500);

        renderPage();

        await expectErrorToast('Teams konnten nicht geladen werden');
    });

    it('sends the team back to the schedule while the ranking is hidden', async () => {
        renderPage(false);

        await waitFor(() => expect(currentPath()).toBe('/tab1'));
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

    it('reloads the ranking on pull-to-refresh', async () => {
        const { container } = renderPage();
        await waitFor(() => expect(rows(container)).toHaveLength(3));
        backend.get(RANKING_URL, ranking().reverse());

        const complete = pullToRefresh(container);

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(rows(container).map(row => row.textContent)).toEqual([
            'Team Peach1. Platz4/8 Spiele',
            'Team Mario2. Platz3/8 Spiele',
            'Team Luigi3. Platz4/8 Spiele',
        ]);
    });
});

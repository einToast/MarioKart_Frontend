import { screen, waitFor } from '@testing-library/react';
import { backend, stubDefaultBackend, stubScheduleState } from '../test/backend';
import { currentPath, loginAsTeam, pullToRefresh, renderWithRouter } from '../test/render';
import Tab4 from './Tab4';

const renderPage = () => {
    const setShowTab2 = vi.fn();
    const view = renderWithRouter(<Tab4 showTab2={true} setShowTab2={setShowTab2} />, { route: '/tab4' });
    return { ...view, setShowTab2 };
};

describe('Tab4 (how to play)', () => {
    beforeEach(() => {
        stubDefaultBackend();
    });

    it('explains the rules and the controls', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'So wird gespielt' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Spielregeln' })).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(7);
        expect(screen.getByText('Die Geschwindigkeit beträgt 100ccm')).toBeInTheDocument();
        expect(screen.getByAltText('pro controller')).toHaveAttribute('src', '/media/procon_how_to_play.jpg');
        expect(screen.getByAltText('joycon')).toHaveAttribute('src', '/media/joycon_how_to_play.jpg');
    });

    it('embeds the explanation video', () => {
        renderPage();

        expect(screen.getByTitle('YouTube Video')).toHaveAttribute('src', expect.stringContaining('https://www.youtube.com/embed/'));
    });

    it('shows the team header for a logged in team', () => {
        loginAsTeam({ name: 'Team Yoshi', character: 'Yoshi' });

        renderPage();

        expect(screen.getByText('Team Yoshi')).toBeInTheDocument();
        expect(screen.getByTitle('Umfragen')).toBeInTheDocument();
    });

    it('shows no team header to visitors who are not logged in', () => {
        renderPage();

        expect(screen.queryByTitle('Umfragen')).not.toBeInTheDocument();
    });

    it('sends visitors to the admin area while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false });

        renderPage();

        await waitFor(() => expect(currentPath()).toBe('/admin'));
    });

    it('stays on the page while the tournament is open', async () => {
        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalled());
        expect(currentPath()).toBe('/tab4');
    });

    // The ranking is hidden exactly while the last group round is running, so that the final
    // standings stay a surprise until the finals are scheduled.
    it.each([
        ['no schedule exists yet', { schedule: false, finalSchedule: false, unplayed: 0 }, true],
        ['several group rounds are open', { schedule: true, finalSchedule: false, unplayed: 2 }, true],
        ['the last group round is running', { schedule: true, finalSchedule: false, unplayed: 1 }, false],
        ['the group phase is over', { schedule: true, finalSchedule: false, unplayed: 0 }, false],
        ['the finals are scheduled', { schedule: true, finalSchedule: true, unplayed: 1 }, true],
    ])('when %s, the ranking tab is shown: %s → %s', async (_description, state, expected) => {
        stubScheduleState(state);

        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(expected));
    });

    it('leaves the ranking tab unchanged when the schedule state cannot be loaded', async () => {
        backend.fail('GET', '/public/schedule/rounds/unplayed', 500);

        const { setShowTab2 } = renderPage();

        await waitFor(() => expect(backend.requestsTo('GET', '/public/schedule/rounds/unplayed')).toHaveLength(1));
        await Promise.resolve();
        expect(setShowTab2).not.toHaveBeenCalled();
    });

    it('updates the ranking tab on pull-to-refresh', async () => {
        const { container, setShowTab2 } = renderPage();
        await waitFor(() => expect(setShowTab2).toHaveBeenCalledWith(true));
        stubScheduleState({ schedule: true, finalSchedule: false, unplayed: 1 });

        const complete = pullToRefresh(container);

        await waitFor(() => expect(complete).toHaveBeenCalledTimes(1), { timeout: 2000 });
        expect(setShowTab2).toHaveBeenLastCalledWith(false);
    });
});

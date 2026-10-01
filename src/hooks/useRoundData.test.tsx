import { act, renderHook, waitFor } from '@testing-library/react';
import { backend, stubDefaultBackend } from '../test/backend';
import { makeBreak, makeGame, makeRound, makeTeam } from '../test/fixtures';
import { createAppWrapper, currentPath } from '../test/render';
import { useRoundData } from './useRoundData';

const CURRENT_ROUNDS_URL = '/public/schedule/rounds/current';

const resting = makeTeam({ id: 9, teamName: 'Team Yoshi', character: { id: 9, characterName: 'Yoshi' } });
const waiting = makeTeam({ id: 8, teamName: 'Team Wario', character: { id: 8, characterName: 'Wario' } });

const round5 = () => makeRound({ id: 5, roundNumber: 5, startTime: '2025-01-08T17:45:00', endTime: '2025-01-08T18:05:30', games: [makeGame({ id: 50 })] });
const round6 = () => makeRound({ id: 6, roundNumber: 6, startTime: '2025-01-08T19:00:00', endTime: '2025-01-08T19:20:00', games: [makeGame({ id: 60 })] });

const renderRoundData = () => renderHook(() => useRoundData(), { wrapper: createAppWrapper('/tab1') });

describe('useRoundData', () => {
    beforeEach(() => {
        stubDefaultBackend();
        backend
            .get('/public/teams/notInRound/5', [resting])
            .get('/public/teams/notInRound/6', [waiting]);
    });

    it('starts without rounds, pausing teams or an error', () => {
        const { result } = renderRoundData();

        expect(result.current).toMatchObject({
            currentRound: null,
            nextRound: null,
            teamsNotInCurrentRound: [],
            teamsNotInNextRound: [],
            error: '',
        });
    });

    it('provides the current and the next round with times shortened to HH:MM', async () => {
        backend.get(CURRENT_ROUNDS_URL, [round5(), round6()]);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.nextRound).not.toBeNull());
        expect(result.current.currentRound).toMatchObject({ id: 5, startTime: '17:45', endTime: '18:05' });
        expect(result.current.nextRound).toMatchObject({ id: 6, startTime: '19:00', endTime: '19:20' });
        expect(result.current.error).toBe('');
    });

    it('provides the teams that pause in the current and in the next round', async () => {
        backend.get(CURRENT_ROUNDS_URL, [round5(), round6()]);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.teamsNotInNextRound).toEqual([waiting]));
        expect(result.current.teamsNotInCurrentRound).toEqual([resting]);
    });

    it('leaves the next round empty during the last round', async () => {
        backend.get(CURRENT_ROUNDS_URL, [round5()]);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.currentRound).toMatchObject({ id: 5 }));
        expect(result.current.nextRound).toBeNull();
    });

    it('keeps both rounds empty when nothing is scheduled', async () => {
        backend.get(CURRENT_ROUNDS_URL, []);

        const { result } = renderRoundData();

        await waitFor(() => expect(backend.requestsTo('GET', '/public/settings')).toHaveLength(1));
        expect(result.current.currentRound).toBeNull();
        expect(result.current.nextRound).toBeNull();
        expect(result.current.error).toBe('');
    });

    it('shows a running break as current and the round after it as next', async () => {
        const afterBreak = { ...round6(), breakTime: makeBreak({ id: 2, startTime: '2025-01-08T18:30:00', endTime: '2025-01-08T19:00:00', breakEnded: false }) };
        backend.get(CURRENT_ROUNDS_URL, [afterBreak, makeRound({ id: 7 })]);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.nextRound).not.toBeNull());
        expect(result.current.currentRound).toMatchObject({ id: 2, breakEnded: false, startTime: '18:30', endTime: '19:00' });
        expect(result.current.nextRound).toMatchObject({ id: 6, startTime: '19:00', endTime: '19:20' });
        expect(result.current.nextRound).toHaveProperty('games');
    });

    it('treats a round whose break has ended like any other round', async () => {
        const afterBreak = { ...round6(), breakTime: makeBreak({ breakEnded: true }) };
        backend.get(CURRENT_ROUNDS_URL, [afterBreak]);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.currentRound).not.toBeNull());
        expect(result.current.currentRound).toMatchObject({ id: 6, startTime: '19:00', endTime: '19:20' });
        expect(result.current.currentRound).toHaveProperty('games');
    });

    it('sends visitors to the admin area while the tournament is closed', async () => {
        backend.get('/public/settings', { tournamentOpen: false });

        renderRoundData();

        await waitFor(() => expect(currentPath()).toBe('/admin'));
    });

    it('stays on the page while the tournament is open', async () => {
        renderRoundData();

        await waitFor(() => expect(backend.requestsTo('GET', '/public/settings')).toHaveLength(1));
        expect(currentPath()).toBe('/tab1');
    });

    it('exposes the error message when the rounds cannot be loaded', async () => {
        backend.fail('GET', CURRENT_ROUNDS_URL, 500);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.error).toBe('Aktuelle Runden konnten nicht geladen werden'));
    });

    it('exposes the error message when the tournament state cannot be loaded', async () => {
        backend.fail('GET', '/public/settings', 500);

        const { result } = renderRoundData();

        await waitFor(() => expect(result.current.error).toBe('Einstellungen konnten nicht geladen werden'));
    });

    it('loads the rounds again on refreshRounds', async () => {
        backend.get(CURRENT_ROUNDS_URL, [round5(), round6()]);
        const { result } = renderRoundData();
        await waitFor(() => expect(result.current.currentRound).toMatchObject({ id: 5 }));

        backend.get(CURRENT_ROUNDS_URL, [round6()]);
        await act(() => result.current.refreshRounds());

        await waitFor(() => expect(result.current.currentRound).toMatchObject({ id: 6 }));
        expect(result.current.nextRound).toBeNull();
    });

    it('clears the current round on refresh once the schedule has finished', async () => {
        backend.get(CURRENT_ROUNDS_URL, [round5()]);
        const { result } = renderRoundData();
        await waitFor(() => expect(result.current.currentRound).toMatchObject({ id: 5 }));

        backend.get(CURRENT_ROUNDS_URL, []);
        await act(() => result.current.refreshRounds());

        expect(result.current.currentRound).toBeNull();
    });
});

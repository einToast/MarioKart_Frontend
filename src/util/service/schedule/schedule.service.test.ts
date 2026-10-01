import { backend } from '../../../test/backend';
import { makeBreak, makeGame, makePoints, makeRound, makeTeam } from '../../../test/fixtures';
import { AdminScheduleService, PublicScheduleService } from './index';

const mario = makeTeam({ id: 1, teamName: 'Team Mario', character: { id: 1, characterName: 'Mario' } });
const luigi = makeTeam({ id: 2, teamName: 'Team Luigi', character: { id: 2, characterName: 'Luigi' }, finalReady: false, active: false });

const marioInput = { teamName: 'Team Mario', characterName: 'Mario', finalReady: true, active: true };
const luigiInput = { teamName: 'Team Luigi', characterName: 'Luigi', finalReady: false, active: false };

describe('PublicScheduleService', () => {
    it('getCurrentRounds returns the rounds', async () => {
        const rounds = [makeRound({ id: 1 }), makeRound({ id: 2 })];
        backend.get('/public/schedule/rounds/current', rounds);

        await expect(PublicScheduleService.getCurrentRounds()).resolves.toEqual(rounds);
    });

    it('getNumberOfRoundsUnplayed returns the count', async () => {
        backend.get('/public/schedule/rounds/unplayed', 4);

        await expect(PublicScheduleService.getNumberOfRoundsUnplayed()).resolves.toBe(4);
    });

    it.each([true, false])('isScheduleCreated returns %s', async (created) => {
        backend.get('/public/schedule/create/schedule', created);

        await expect(PublicScheduleService.isScheduleCreated()).resolves.toBe(created);
    });

    it.each([true, false])('isFinalScheduleCreated returns %s', async (created) => {
        backend.get('/public/schedule/create/final_schedule', created);

        await expect(PublicScheduleService.isFinalScheduleCreated()).resolves.toBe(created);
    });

    it.each([
        [0, true],
        [1, true],
        [2, false],
        [8, false],
    ])('isNumberOfRoundsUnplayedLessThanTwo with %i unplayed rounds is %s', async (unplayed, expected) => {
        backend.get('/public/schedule/rounds/unplayed', unplayed);

        await expect(PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()).resolves.toBe(expected);
    });

    it.each([
        [0, true],
        [1, false],
        [8, false],
    ])('isNumberOfRoundsUnplayedZero with %i unplayed rounds is %s', async (unplayed, expected) => {
        backend.get('/public/schedule/rounds/unplayed', unplayed);

        await expect(PublicScheduleService.isNumberOfRoundsUnplayedZero()).resolves.toBe(expected);
    });

    it('propagates the API error message', async () => {
        backend.fail('GET', '/public/schedule/rounds/unplayed', 500);

        await expect(PublicScheduleService.isNumberOfRoundsUnplayedZero())
            .rejects.toThrow('Anzahl der ungespielten Runden konnte nicht geladen werden');
    });
});

describe('AdminScheduleService', () => {
    describe('create and delete', () => {
        it('createSchedule maps its arguments onto the schedule input', async () => {
            const rounds = [makeRound()];
            backend.post('/admin/schedule/create/schedule', rounds);

            await expect(AdminScheduleService.createSchedule(2, 3, 10, 4)).resolves.toEqual(rounds);
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: '/admin/schedule/create/schedule',
                body: { version: 2, numFields: 3, numRounds: 10, teamsPerGame: 4 },
            }]);
        });

        it('createFinalSchedule returns the final rounds', async () => {
            const rounds = [makeRound({ finalGame: true })];
            backend.post('/admin/schedule/create/final_schedule', rounds);

            await expect(AdminScheduleService.createFinalSchedule()).resolves.toEqual(rounds);
        });

        it('deleteSchedule deletes the schedule', async () => {
            backend.delete('/admin/schedule/create/schedule');

            await AdminScheduleService.deleteSchedule();

            expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/schedule/create/schedule', body: undefined }]);
        });

        it('deleteFinalSchedule deletes the final schedule', async () => {
            backend.delete('/admin/schedule/create/final_schedule');

            await AdminScheduleService.deleteFinalSchedule();

            expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/schedule/create/final_schedule', body: undefined }]);
        });
    });

    describe('read', () => {
        it('getRounds returns all rounds', async () => {
            const rounds = [makeRound({ id: 1 }), makeRound({ id: 2 })];
            backend.get('/admin/schedule/rounds', rounds);

            await expect(AdminScheduleService.getRounds()).resolves.toEqual(rounds);
        });

        it('getRoundById returns the round', async () => {
            const round = makeRound({ id: 6 });
            backend.get('/admin/schedule/rounds/6', round);

            await expect(AdminScheduleService.getRoundById(6)).resolves.toEqual(round);
        });

        it('getBreak returns the break', async () => {
            const aBreak = makeBreak();
            backend.get('/admin/schedule/break', aBreak);

            await expect(AdminScheduleService.getBreak()).resolves.toEqual(aBreak);
        });
    });

    describe('simple updates', () => {
        it('updateRoundPlayed sends the played flag', async () => {
            backend.put('/admin/schedule/rounds/6', makeRound({ id: 6, played: true }));

            await AdminScheduleService.updateRoundPlayed(6, true);

            expect(backend.requests).toEqual([{ method: 'PUT', url: '/admin/schedule/rounds/6', body: { played: true } }]);
        });

        it('updatePoints addresses the points of one team in one game', async () => {
            const points = makePoints(luigi, 9);
            backend.put('/admin/schedule/rounds/6/games/3/teams/2/points', points);

            await expect(AdminScheduleService.updatePoints(6, 3, 2, 9)).resolves.toEqual(points);
            expect(backend.requests[0].body).toEqual({ points: 9 });
        });

        it('updateBreak maps its arguments onto the break input', async () => {
            backend.put('/admin/schedule/break', makeBreak());

            await AdminScheduleService.updateBreak(6, 45, true);

            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/schedule/break',
                body: { roundId: 6, breakDuration: 45, breakEnded: true },
            }]);
        });
    });

    describe('saveRoundFull', () => {
        it('sends every game with its points in a single request', async () => {
            const round = makeRound({
                id: 6,
                played: true,
                games: [
                    makeGame({ id: 3, teams: [mario, luigi], points: [makePoints(mario, 15), makePoints(luigi, 9)] }),
                    makeGame({ id: 4, teams: [luigi], points: [makePoints(luigi, 12)] }),
                ],
            });
            backend.put('/admin/schedule/rounds/6/full', round);

            await expect(AdminScheduleService.saveRoundFull(round)).resolves.toEqual(round);
            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/schedule/rounds/6/full',
                body: {
                    played: true,
                    games: [
                        { id: 3, points: [{ points: 15, team: marioInput }, { points: 9, team: luigiInput }] },
                        { id: 4, points: [{ points: 12, team: luigiInput }] },
                    ],
                },
            }]);
        });

        it('sends an empty points list for a game that has no points yet', async () => {
            const round = makeRound({ id: 6, games: [makeGame({ id: 3, points: null })] });
            backend.put('/admin/schedule/rounds/6/full', round);

            await AdminScheduleService.saveRoundFull(round);

            expect(backend.requests[0].body).toEqual({ played: false, games: [{ id: 3, points: [] }] });
        });
    });

    describe('saveRound', () => {
        it('updates the points of every team and then marks the round as played', async () => {
            const round = makeRound({
                id: 6,
                played: true,
                games: [
                    makeGame({ id: 3, teams: [mario, luigi], points: [makePoints(luigi, 9), makePoints(mario, 15)] }),
                    makeGame({ id: 4, teams: [mario], points: [makePoints(mario, 7)] }),
                ],
            });
            backend.put(/^\/admin\/schedule\/rounds\/6\/games\//, makePoints(mario, 0)).put('/admin/schedule/rounds/6', round);

            await expect(AdminScheduleService.saveRound(round)).resolves.toEqual(round);
            expect(backend.requests).toEqual([
                { method: 'PUT', url: '/admin/schedule/rounds/6/games/3/teams/1/points', body: { points: 15 } },
                { method: 'PUT', url: '/admin/schedule/rounds/6/games/3/teams/2/points', body: { points: 9 } },
                { method: 'PUT', url: '/admin/schedule/rounds/6/games/4/teams/1/points', body: { points: 7 } },
                { method: 'PUT', url: '/admin/schedule/rounds/6', body: { played: true } },
            ]);
        });

        it('saves 0 points for a team without a points entry', async () => {
            const round = makeRound({ id: 6, games: [makeGame({ id: 3, teams: [mario, luigi], points: [makePoints(mario, 15)] })] });
            backend.put(/^\/admin\/schedule\/rounds\/6\/games\//, makePoints(mario, 0)).put('/admin/schedule/rounds/6', round);

            await AdminScheduleService.saveRound(round);

            expect(backend.requestsTo('PUT', '/admin/schedule/rounds/6/games/3/teams/2/points')[0].body).toEqual({ points: 0 });
        });

        it('does not mark the round as played when saving points fails', async () => {
            const round = makeRound({ id: 6, games: [makeGame({ id: 3, teams: [mario] })] });
            backend.fail('PUT', '/admin/schedule/rounds/6/games/3/teams/1/points', 404);

            await expect(AdminScheduleService.saveRound(round)).rejects.toThrow('Eintrag nicht gefunden');
            expect(backend.requestsTo('PUT', '/admin/schedule/rounds/6')).toEqual([]);
        });
    });

    describe('saveGameDirect', () => {
        it('sends the game with the points and team data of every entry', async () => {
            const game = makeGame({ id: 3, teams: [mario, luigi], points: [makePoints(mario, 15), makePoints(luigi, 9)] });
            backend.put('/admin/schedule/games/3', game);

            await expect(AdminScheduleService.saveGameDirect(game)).resolves.toEqual(game);
            expect(backend.requests).toEqual([{
                method: 'PUT',
                url: '/admin/schedule/games/3',
                body: { id: 3, points: [{ points: 15, team: marioInput }, { points: 9, team: luigiInput }] },
            }]);
        });

        it('sends an empty points list for a game that has no points yet', async () => {
            const game = makeGame({ id: 3, points: null });
            backend.put('/admin/schedule/games/3', game);

            await AdminScheduleService.saveGameDirect(game);

            expect(backend.requests[0].body).toEqual({ id: 3, points: [] });
        });
    });

    describe('saveGame', () => {
        it('updates the points team by team and returns the saved entries', async () => {
            const game = makeGame({ id: 3, teams: [mario, luigi], points: [makePoints(mario, 15)] });
            backend.on('PUT', /^\/admin\/schedule\/rounds\/6\/games\/3\/teams\/\d+\/points$/, (request) => ({
                data: { saved: request.url, ...(request.body as object) },
            }));

            await expect(AdminScheduleService.saveGame(6, game)).resolves.toEqual([
                { saved: '/admin/schedule/rounds/6/games/3/teams/1/points', points: 15 },
                { saved: '/admin/schedule/rounds/6/games/3/teams/2/points', points: 0 },
            ]);
        });
    });
});

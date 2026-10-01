import { backend } from '../../../test/backend';
import { makeTeam, makeTeams } from '../../../test/fixtures';
import { AdminRegistrationService, PublicRegistrationService } from './index';

describe('PublicRegistrationService', () => {
    describe('registerTeam', () => {
        it('registers an active, final-ready team', async () => {
            const created = makeTeam({ id: 9, teamName: 'Team Yoshi', character: { id: 42, characterName: 'Yoshi' } });
            backend.post('/public/teams', created);

            await expect(PublicRegistrationService.registerTeam('Team Yoshi', 'Yoshi')).resolves.toEqual(created);
            expect(backend.requests).toEqual([{
                method: 'POST',
                url: '/public/teams',
                body: { teamName: 'Team Yoshi', characterName: 'Yoshi', finalReady: true, active: true },
            }]);
        });

        it('rejects an empty team name without calling the backend', async () => {
            await expect(PublicRegistrationService.registerTeam('', 'Yoshi'))
                .rejects.toThrow('Der Teamname darf nicht leer sein!');
            expect(backend.requests).toEqual([]);
        });

        it('rejects a missing character without calling the backend', async () => {
            await expect(PublicRegistrationService.registerTeam('Team Yoshi', ''))
                .rejects.toThrow('Der Charakter darf nicht leer sein!');
            expect(backend.requests).toEqual([]);
        });

        it('reports the missing team name first when both fields are empty', async () => {
            await expect(PublicRegistrationService.registerTeam('', ''))
                .rejects.toThrow('Der Teamname darf nicht leer sein!');
        });

        it('propagates the API error message', async () => {
            backend.fail('POST', '/public/teams', 400);

            await expect(PublicRegistrationService.registerTeam('Team Yoshi', 'Yoshi'))
                .rejects.toThrow('Charakter schon registriert');
        });
    });

    it.each([
        ['getTeams', () => PublicRegistrationService.getTeams(), '/public/teams'],
        ['getTeamsSortedByGroupPoints', () => PublicRegistrationService.getTeamsSortedByGroupPoints(), '/public/teams/sortedByGroupPoints'],
        ['getTeamsSortedByTeamName', () => PublicRegistrationService.getTeamsSortedByTeamName(), '/public/teams/sortedByTeamName'],
        ['getTeamsNotInRound', () => PublicRegistrationService.getTeamsNotInRound(3), '/public/teams/notInRound/3'],
    ])('%s returns the teams from %s', async (_name, call, url) => {
        const teams = makeTeams();
        backend.get(url as string, teams);

        await expect((call as () => Promise<unknown>)()).resolves.toEqual(teams);
    });

    it('getAvailableCharacters returns the free characters', async () => {
        const available = [{ id: 1, characterName: 'Mario' }, { id: 2, characterName: 'Luigi' }];
        backend.get('/public/teams/characters/available', available);

        await expect(PublicRegistrationService.getAvailableCharacters()).resolves.toEqual(available);
    });
});

describe('AdminRegistrationService', () => {
    const team = makeTeam({
        id: 5,
        teamName: 'Team Toad',
        character: { id: 8, characterName: 'Toad' },
        finalReady: false,
        active: true,
        groupPoints: 30,
        finalPoints: 12,
        numberOfGamesPlayed: 6,
    });

    it('deleteTeam deletes the team by its id', async () => {
        backend.delete('/admin/teams/5');

        await AdminRegistrationService.deleteTeam(team);

        expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/teams/5', body: undefined }]);
    });

    it('deleteAllTeams deletes the whole collection', async () => {
        backend.delete('/admin/teams');

        await AdminRegistrationService.deleteAllTeams();

        expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/teams', body: undefined }]);
    });

    it('getTeamsSortedByFinalPoints returns the teams', async () => {
        backend.get('/admin/teams/sortedByFinalPoints', [team]);

        await expect(AdminRegistrationService.getTeamsSortedByFinalPoints()).resolves.toEqual([team]);
    });

    it('getFinalTeams returns the teams', async () => {
        backend.get('/admin/teams/finalTeams', [team]);

        await expect(AdminRegistrationService.getFinalTeams()).resolves.toEqual([team]);
    });

    it('updateTeam sends only the editable fields of the team', async () => {
        backend.put('/admin/teams/5', team);

        await expect(AdminRegistrationService.updateTeam(team)).resolves.toEqual(team);
        expect(backend.requests).toEqual([{
            method: 'PUT',
            url: '/admin/teams/5',
            body: { teamName: 'Team Toad', characterName: 'Toad', finalReady: false, active: true },
        }]);
    });

    it('updateTeamNameAndCharacter replaces name and character but keeps the participation flags', async () => {
        backend.put('/admin/teams/5', team);

        await AdminRegistrationService.updateTeamNameAndCharacter(team, 'Die Pilze', 'Toadette');

        expect(backend.requests).toEqual([{
            method: 'PUT',
            url: '/admin/teams/5',
            body: { teamName: 'Die Pilze', characterName: 'Toadette', finalReady: false, active: true },
        }]);
    });

    it('resetEveryTeamFinalParticipation returns the updated teams', async () => {
        backend.put('/admin/teams/finalParticipation/reset', [team]);

        await expect(AdminRegistrationService.resetEveryTeamFinalParticipation()).resolves.toEqual([team]);
    });

    it('propagates the API error message', async () => {
        backend.fail('PUT', '/admin/teams/5', 400);

        await expect(AdminRegistrationService.updateTeam(team)).rejects.toThrow('Charakter ist bereits vergeben');
    });
});

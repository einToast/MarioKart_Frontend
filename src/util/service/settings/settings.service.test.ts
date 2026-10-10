import { backend } from '../../../test/backend';
import { makeQuestion } from '../../../test/fixtures';
import { ChangeType, SurveyKeyMode } from '../util';
import { AdminSettingsService, PublicSettingsService } from './index';

const SETTINGS_URL = '/public/settings';
const ADMIN_SETTINGS_URL = '/admin/settings';

describe('PublicSettingsService', () => {
    it('getSettings returns the tournament settings', async () => {
        const settings = { tournamentOpen: true, registrationOpen: false, maxGamesCount: 8, surveyKeyMode: SurveyKeyMode.REQUIRED };
        backend.get(SETTINGS_URL, settings);

        await expect(PublicSettingsService.getSettings()).resolves.toEqual(settings);
    });

    it('reads each setting from the settings object', async () => {
        backend.get(SETTINGS_URL, { tournamentOpen: true, registrationOpen: true, maxGamesCount: 8, surveyKeyMode: SurveyKeyMode.REQUIRED });

        await expect(PublicSettingsService.getTournamentOpen()).resolves.toBe(true);
        await expect(PublicSettingsService.getRegistrationOpen()).resolves.toBe(true);
        await expect(PublicSettingsService.getMaxGamesCount()).resolves.toBe(8);
        await expect(PublicSettingsService.getSurveyKeyMode()).resolves.toBe(SurveyKeyMode.REQUIRED);
    });

    it('reads the switches and the size of the final', async () => {
        const switches = [{ name: 'Blau', color: '#9DAEDA' }];
        backend.get(SETTINGS_URL, { finalTeamsCount: 8, switches });

        await expect(PublicSettingsService.getSwitches()).resolves.toEqual(switches);
        await expect(PublicSettingsService.getFinalTeamsCount()).resolves.toBe(8);
    });

    it('falls back to closed, 0 games and disabled survey keys for settings the backend leaves out', async () => {
        backend.get(SETTINGS_URL, {});

        await expect(PublicSettingsService.getTournamentOpen()).resolves.toBe(false);
        await expect(PublicSettingsService.getRegistrationOpen()).resolves.toBe(false);
        await expect(PublicSettingsService.getMaxGamesCount()).resolves.toBe(0);
        await expect(PublicSettingsService.getSurveyKeyMode()).resolves.toBe(SurveyKeyMode.DISABLED);
        await expect(PublicSettingsService.getSwitches()).resolves.toEqual([]);
        await expect(PublicSettingsService.getFinalTeamsCount()).resolves.toBe(4);
    });

    it('propagates the API error message', async () => {
        backend.fail('GET', SETTINGS_URL, 404);

        await expect(PublicSettingsService.getTournamentOpen()).rejects.toThrow('Einstellungen nicht gefunden');
    });
});

describe('AdminSettingsService', () => {
    it('updateSettings sends the settings unchanged', async () => {
        const settings = { tournamentOpen: false, maxGamesCount: 6 };
        backend.put(ADMIN_SETTINGS_URL, settings);

        await expect(AdminSettingsService.updateSettings(settings)).resolves.toEqual(settings);
        expect(backend.requests).toEqual([{ method: 'PUT', url: ADMIN_SETTINGS_URL, body: settings }]);
    });

    it.each([
        ['updateRegistrationOpen', () => AdminSettingsService.updateRegistrationOpen(true), { registrationOpen: true }],
        ['updateTournamentOpen', () => AdminSettingsService.updateTournamentOpen(false), { tournamentOpen: false }],
        ['updateSurveyKeyMode', () => AdminSettingsService.updateSurveyKeyMode(SurveyKeyMode.DISTRIBUTING), { surveyKeyMode: 'DISTRIBUTING' }],
        ['updateFinalTeamsCount', () => AdminSettingsService.updateFinalTeamsCount(8), { finalTeamsCount: 8 }],
        ['updateProgram', () => AdminSettingsService.updateProgram('{"entries":[]}'), { program: '{"entries":[]}' }],
        ['updateVenue', () => AdminSettingsService.updateVenue([{ name: 'Blau', color: '#9DAEDA' }], '{"elements":[]}'), { switches: [{ name: 'Blau', color: '#9DAEDA' }], floorPlan: '{"elements":[]}' }],
    ])('%s updates only its own setting', async (_name, call, body) => {
        backend.put(ADMIN_SETTINGS_URL, body);

        await (call as () => Promise<unknown>)();

        expect(backend.requests).toEqual([{ method: 'PUT', url: ADMIN_SETTINGS_URL, body }]);
    });

    it('reset wipes the application data', async () => {
        backend.delete('/admin/settings/reset');

        await AdminSettingsService.reset();

        expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/settings/reset', body: undefined }]);
    });

    describe('changeService', () => {
        it.each([
            [true, false],
            [false, true],
        ])('TOURNAMENT toggles a tournament that is open=%s to open=%s', async (current, expected) => {
            backend.get(SETTINGS_URL, { tournamentOpen: current }).put(ADMIN_SETTINGS_URL, {});

            await AdminSettingsService.changeService(ChangeType.TOURNAMENT);

            expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body).toEqual({ tournamentOpen: expected });
        });

        it.each([
            [true, false],
            [false, true],
        ])('REGISTRATION toggles a registration that is open=%s to open=%s', async (current, expected) => {
            backend.get(SETTINGS_URL, { registrationOpen: current }).put(ADMIN_SETTINGS_URL, {});

            await AdminSettingsService.changeService(ChangeType.REGISTRATION);

            expect(backend.requestsTo('PUT', ADMIN_SETTINGS_URL)[0].body).toEqual({ registrationOpen: expected });
        });

        it('SURVEYS deletes every question', async () => {
            backend
                .get('/admin/survey', [makeQuestion({ id: 3 }), makeQuestion({ id: 8 })])
                .delete(/^\/admin\/survey\/\d+$/);

            await AdminSettingsService.changeService(ChangeType.SURVEYS);

            expect(backend.requests.filter(request => request.method === 'DELETE').map(request => request.url))
                .toEqual(['/admin/survey/3', '/admin/survey/8']);
        });

        it.each([
            [ChangeType.TEAMS, '/admin/teams'],
            [ChangeType.SCHEDULE, '/admin/schedule/create/schedule'],
            [ChangeType.FINAL_SCHEDULE, '/admin/schedule/create/final_schedule'],
            [ChangeType.ALL, '/admin/settings/reset'],
        ])('%s sends DELETE %s', async (changeType, url) => {
            backend.delete(url);

            await AdminSettingsService.changeService(changeType);

            expect(backend.requests).toEqual([{ method: 'DELETE', url, body: undefined }]);
        });

        it('rejects an unknown change type without calling the backend', async () => {
            await expect(AdminSettingsService.changeService('Sonstiges' as ChangeType)).rejects.toThrow('Error');
            expect(backend.requests).toEqual([]);
        });

        it('propagates the API error message', async () => {
            backend.fail('DELETE', '/admin/teams', 409);

            await expect(AdminSettingsService.changeService(ChangeType.TEAMS))
                .rejects.toThrow('Spielplan wurde bereits erstellt');
        });
    });
});

import { describeEndpoint } from '../../../test/endpoint';
import { SurveyKeyMode } from '../../service/util';
import { TournamentDTO } from '../config/dto';
import { AdminSettingsApi, PublicSettingsApi } from './index';

const settings: TournamentDTO = {
    tournamentOpen: true,
    registrationOpen: false,
    maxGamesCount: 8,
    surveyKeyMode: SurveyKeyMode.DISTRIBUTING,
};

describe('PublicSettingsApi', () => {
    describeEndpoint('getSettings', {
        call: () => PublicSettingsApi.getSettings(),
        method: 'GET',
        url: '/public/settings',
        response: settings,
        errors: {
            404: 'Einstellungen nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Einstellungen konnten nicht geladen werden',
    });
});

describe('AdminSettingsApi', () => {
    describeEndpoint('updateSettings', {
        call: () => AdminSettingsApi.updateSettings({ registrationOpen: false }),
        method: 'PUT',
        url: '/admin/settings',
        body: { registrationOpen: false },
        response: settings,
        errors: {
            409: 'Spielplan wurde bereits erstellt',
            404: 'Einstellungen nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Einstellungen konnten nicht aktualisiert werden',
    });

    describeEndpoint('reset', {
        call: () => AdminSettingsApi.reset(),
        method: 'DELETE',
        url: '/admin/settings/reset',
        returnsVoid: true,
        errors: {
            409: 'Spielplan wurde bereits erstellt',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Daten konnten nicht zurückgesetzt werden',
    });
});

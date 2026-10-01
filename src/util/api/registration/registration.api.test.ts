import { describeEndpoint } from '../../../test/endpoint';
import { makeTeam, makeTeams } from '../../../test/fixtures';
import { TeamInputDTO } from '../config/dto';
import { AdminRegistrationApi, PublicRegistrationApi } from './index';

const teamInput: TeamInputDTO = { teamName: 'Team Mario', characterName: 'Mario', finalReady: true, active: true };

describe('PublicRegistrationApi', () => {
    describeEndpoint('registerTeam', {
        call: () => PublicRegistrationApi.registerTeam(teamInput),
        method: 'POST',
        url: '/public/teams',
        body: teamInput,
        response: makeTeam(),
        errors: {
            409: 'Registrierung ist nicht möglich',
            404: 'Charakter nicht gefunden',
            400: 'Charakter schon registriert',
        },
        fallback: 'Registrierung fehlgeschlagen',
    });

    describeEndpoint('getTeams', {
        call: () => PublicRegistrationApi.getTeams(),
        method: 'GET',
        url: '/public/teams',
        response: makeTeams(),
        fallback: 'Teams konnten nicht geladen werden',
    });

    describeEndpoint('getTeamsSortedByGroupPoints', {
        call: () => PublicRegistrationApi.getTeamsSortedByGroupPoints(),
        method: 'GET',
        url: '/public/teams/sortedByGroupPoints',
        response: makeTeams(),
        fallback: 'Teams konnten nicht geladen werden',
    });

    describeEndpoint('getTeamsSortedByTeamName', {
        call: () => PublicRegistrationApi.getTeamsSortedByTeamName(),
        method: 'GET',
        url: '/public/teams/sortedByTeamName',
        response: makeTeams(),
        fallback: 'Teams konnten nicht geladen werden',
    });

    describeEndpoint('getAvailableCharacters', {
        call: () => PublicRegistrationApi.getAvailableCharacters(),
        method: 'GET',
        url: '/public/teams/characters/available',
        response: [{ id: 1, characterName: 'Mario' }],
        fallback: 'Charaktere konnten nicht geladen werden',
    });

    describeEndpoint('getTeamsNotInRound', {
        call: () => PublicRegistrationApi.getTeamsNotInRound(7),
        method: 'GET',
        url: '/public/teams/notInRound/7',
        response: makeTeams(),
        fallback: 'Teams konnten nicht geladen werden',
    });
});

describe('AdminRegistrationApi', () => {
    describeEndpoint('deleteTeam', {
        call: () => AdminRegistrationApi.deleteTeam(3),
        method: 'DELETE',
        url: '/admin/teams/3',
        returnsVoid: true,
        errors: {
            409: 'Spielplan wurde bereits erstellt',
            404: 'Team nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Team konnte nicht gelöscht werden',
    });

    describeEndpoint('deleteAllTeams', {
        call: () => AdminRegistrationApi.deleteAllTeams(),
        method: 'DELETE',
        url: '/admin/teams',
        returnsVoid: true,
        errors: {
            409: 'Spielplan wurde bereits erstellt',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Teams konnten nicht gelöscht werden',
    });

    describeEndpoint('getTeamsSortedByFinalPoints', {
        call: () => AdminRegistrationApi.getTeamsSortedByFinalPoints(),
        method: 'GET',
        url: '/admin/teams/sortedByFinalPoints',
        response: makeTeams(),
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Teams konnten nicht abgerufen werden',
    });

    describeEndpoint('getFinalTeams', {
        call: () => AdminRegistrationApi.getFinalTeams(),
        method: 'GET',
        url: '/admin/teams/finalTeams',
        response: makeTeams(),
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Team konnte nicht abgerufen werden',
    });

    describeEndpoint('updateTeam', {
        call: () => AdminRegistrationApi.updateTeam(3, teamInput),
        method: 'PUT',
        url: '/admin/teams/3',
        body: teamInput,
        response: makeTeam({ id: 3 }),
        errors: {
            404: 'Team nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Charakter ist bereits vergeben',
        },
        fallback: 'Team konnte nicht aktualisiert werden',
    });

    describeEndpoint('resetEveryTeamFinalParticipation', {
        call: () => AdminRegistrationApi.resetEveryTeamFinalParticipation(),
        method: 'PUT',
        url: '/admin/teams/finalParticipation/reset',
        response: makeTeams(),
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Teams konnten nicht zurückgesetzt werden',
    });
});

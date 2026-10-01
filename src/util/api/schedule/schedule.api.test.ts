import { describeEndpoint } from '../../../test/endpoint';
import { makeBreak, makeGame, makePoints, makeRound, makeTeam } from '../../../test/fixtures';
import { BreakInputDTO, GameInputFullDTO, RoundInputFullDTO, ScheduleInputDTO } from '../config/dto';
import { AdminScheduleApi, PublicScheduleApi } from './index';

const scheduleInput: ScheduleInputDTO = { version: 2, numFields: 4, numRounds: 8, teamsPerGame: 4 };
const breakInput: BreakInputDTO = { roundId: 6, breakDuration: 30, breakEnded: false };
const gameInput: GameInputFullDTO = {
    id: 9,
    points: [{ points: 12, team: { teamName: 'Team Mario', characterName: 'Mario', finalReady: true, active: true } }],
};
const roundInput: RoundInputFullDTO = { played: true, games: [gameInput] };

describe('PublicScheduleApi', () => {
    describeEndpoint('getCurrentRounds', {
        call: () => PublicScheduleApi.getCurrentRounds(),
        method: 'GET',
        url: '/public/schedule/rounds/current',
        response: [makeRound()],
        fallback: 'Aktuelle Runden konnten nicht geladen werden',
    });

    describeEndpoint('getNumberOfRoundsUnplayed', {
        call: () => PublicScheduleApi.getNumberOfRoundsUnplayed(),
        method: 'GET',
        url: '/public/schedule/rounds/unplayed',
        response: 3,
        fallback: 'Anzahl der ungespielten Runden konnte nicht geladen werden',
    });

    describeEndpoint('isScheduleCreated', {
        call: () => PublicScheduleApi.isScheduleCreated(),
        method: 'GET',
        url: '/public/schedule/create/schedule',
        response: true,
        fallback: 'Spielplan-Status konnte nicht geladen werden',
    });

    describeEndpoint('isFinalScheduleCreated', {
        call: () => PublicScheduleApi.isFinalScheduleCreated(),
        method: 'GET',
        url: '/public/schedule/create/final_schedule',
        response: true,
        fallback: 'Finalrunden-Status konnte nicht geladen werden',
    });
});

describe('AdminScheduleApi', () => {
    describeEndpoint('createSchedule', {
        call: () => AdminScheduleApi.createSchedule(scheduleInput),
        method: 'POST',
        url: '/admin/schedule/create/schedule',
        body: scheduleInput,
        response: [makeRound()],
        errors: {
            409: 'Spielplan existiert bereits',
            404: 'Nicht genügend Teams vorhanden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Ungültige Parameter für die Spielplanerstellung',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Spielplan konnte nicht erstellt werden',
    });

    describeEndpoint('createFinalSchedule', {
        call: () => AdminScheduleApi.createFinalSchedule(),
        method: 'POST',
        url: '/admin/schedule/create/final_schedule',
        response: [makeRound({ finalGame: true })],
        errors: {
            409: 'Finalrunden existieren bereits',
            404: 'Nicht genügend Teams vorhanden',
            401: 'Nicht autorisierter Zugriff',
            400: 'Noch nicht alle Runden gespielt',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Finalrunden konnten nicht erstellt werden',
    });

    describeEndpoint('deleteSchedule', {
        call: () => AdminScheduleApi.deleteSchedule(),
        method: 'DELETE',
        url: '/admin/schedule/create/schedule',
        returnsVoid: true,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Spielplan konnte nicht gelöscht werden',
    });

    describeEndpoint('deleteFinalSchedule', {
        call: () => AdminScheduleApi.deleteFinalSchedule(),
        method: 'DELETE',
        url: '/admin/schedule/create/final_schedule',
        returnsVoid: true,
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Finalrunden konnten nicht gelöscht werden',
    });

    describeEndpoint('getRounds', {
        call: () => AdminScheduleApi.getRounds(),
        method: 'GET',
        url: '/admin/schedule/rounds',
        response: [makeRound()],
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Runden konnten nicht geladen werden',
    });

    describeEndpoint('getRoundById', {
        call: () => AdminScheduleApi.getRoundById(4),
        method: 'GET',
        url: '/admin/schedule/rounds/4',
        response: makeRound({ id: 4 }),
        errors: {
            404: 'Runde nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Runde konnte nicht geladen werden',
    });

    describeEndpoint('getBreak', {
        call: () => AdminScheduleApi.getBreak(),
        method: 'GET',
        url: '/admin/schedule/break',
        response: makeBreak(),
        errors: { 401: 'Nicht autorisierter Zugriff' },
        fallback: 'Pause konnte nicht geladen werden',
    });

    describeEndpoint('updateRoundPlayed', {
        call: () => AdminScheduleApi.updateRoundPlayed(4, { played: true }),
        method: 'PUT',
        url: '/admin/schedule/rounds/4',
        body: { played: true },
        response: makeRound({ id: 4, played: true }),
        errors: {
            409: 'Pause wurde noch nicht beendet',
            404: 'Runde nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Runde konnte nicht aktualisiert werden',
    });

    describeEndpoint('updatePoints', {
        call: () => AdminScheduleApi.updatePoints(4, 9, 2, { points: 12 }),
        method: 'PUT',
        url: '/admin/schedule/rounds/4/games/9/teams/2/points',
        body: { points: 12 },
        response: makePoints(makeTeam({ id: 2 }), 12),
        errors: {
            404: 'Eintrag nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Punkte konnten nicht aktualisiert werden',
    });

    describeEndpoint('updateBreak', {
        call: () => AdminScheduleApi.updateBreak(breakInput),
        method: 'PUT',
        url: '/admin/schedule/break',
        body: breakInput,
        response: makeBreak(),
        errors: {
            404: 'Pause nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Pause konnte nicht aktualisiert werden',
    });

    describeEndpoint('updateRoundFull', {
        call: () => AdminScheduleApi.updateRoundFull(4, roundInput),
        method: 'PUT',
        url: '/admin/schedule/rounds/4/full',
        body: roundInput,
        response: makeRound({ id: 4, played: true }),
        errors: {
            409: 'Pause wurde noch nicht beendet',
            404: 'Runde nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
            500: 'Benachrichtigung konnte nicht gesendet werden',
        },
        fallback: 'Runde konnte nicht aktualisiert werden',
    });

    describeEndpoint('updateGame', {
        call: () => AdminScheduleApi.updateGame(9, gameInput),
        method: 'PUT',
        url: '/admin/schedule/games/9',
        body: gameInput,
        response: makeGame({ id: 9 }),
        errors: {
            404: 'Spiel nicht gefunden',
            401: 'Nicht autorisierter Zugriff',
        },
        fallback: 'Spiel konnte nicht aktualisiert werden',
    });
});

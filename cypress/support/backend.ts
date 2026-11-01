/// <reference types="cypress" />

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const API_URL = 'http://localhost:8080/api';

export const ADMIN = { username: 'admin', password: 'integration-password' };

export const SWITCHES = [
    { name: 'Blau', color: '#9DAEDA' },
    { name: 'Rot', color: '#DA9DC9' },
    { name: 'Grün', color: '#9DDAB0' },
    { name: 'Gelb', color: '#DAD49D' },
];

export const TEAMS = [
    { teamName: 'Team Mario', characterName: 'Mario' },
    { teamName: 'Team Luigi', characterName: 'Luigi' },
    { teamName: 'Team Peach', characterName: 'Peach' },
    { teamName: 'Team Yoshi', characterName: 'Yoshi' },
    { teamName: 'Team Bowser', characterName: 'Bowser' },
    { teamName: 'Team Toad', characterName: 'Toad' },
    { teamName: 'Team Donkey-Kong', characterName: 'Donkey-Kong' },
    { teamName: 'Team Wario', characterName: 'Wario' },
    { teamName: 'Team Waluigi', characterName: 'Waluigi' },
    { teamName: 'Team Daisy', characterName: 'Daisy' },
    { teamName: 'Team Rosalina', characterName: 'Rosalina' },
    { teamName: 'Team Metall-Mario', characterName: 'Metall-Mario' },
    { teamName: 'Team Shy-Guy', characterName: 'Shy-Guy' },
    { teamName: 'Team Knochentrocken', characterName: 'Knochentrocken' },
    { teamName: 'Team Lakitu', characterName: 'Lakitu' },
    { teamName: 'Team König-Buu-Huu', characterName: 'König-Buu-Huu' },
    { teamName: 'Team Koopa', characterName: 'Koopa' },
    { teamName: 'Team Inkling-Mädchen', characterName: 'Inkling-Mädchen' },
    { teamName: 'Team Bewohner', characterName: 'Bewohner' },
    { teamName: 'Team Baby-Daisy', characterName: 'Baby-Daisy' },
    { teamName: 'Team Melinda', characterName: 'Melinda' },
];

export const SCHEDULE = { version: 2, numFields: SWITCHES.length, numRounds: 8, teamsPerGame: 4 };

export interface BackendTeam {
    id: number;
    teamName: string;
}

export interface BackendGame {
    id: number;
    switchIndex: number;
    teams: BackendTeam[];
}

export interface BackendRound {
    id: number;
    roundNumber: number;
    played: boolean;
    games: BackendGame[];
}

const publicPost = (path: string, body: Cypress.RequestBody) =>
    cy.request(`${API_URL}/public/healthcheck`)
        .then(() => cy.getCookie('XSRF-TOKEN'))
        .then(csrf => cy.request({
            method: 'POST',
            url: `${API_URL}${path}`,
            body,
            headers: { 'X-XSRF-TOKEN': csrf?.value ?? '' },
        }));

Cypress.Commands.add('adminApi', (method: Method, path: string, body?: Cypress.RequestBody) => {
    return cy.get<string>('@adminToken').then(token => cy.request({
        method,
        url: `${API_URL}${path}`,
        body,
        headers: { Authorization: `Bearer ${token}` },
    }));
});

Cypress.Commands.add('resetBackend', ({ open = true }: { open?: boolean } = {}) => {
    publicPost('/public/user/login', ADMIN);
    cy.getCookie('authToken').then(cookie => {
        expect(cookie, 'admin session cookie').to.have.property('value');
        cy.wrap(cookie!.value).as('adminToken');
    });
    cy.clearAllCookies();

    cy.adminApi('DELETE', '/admin/settings/reset');
    cy.adminApi('PUT', '/admin/settings', { tournamentOpen: open, registrationOpen: open, switches: SWITCHES });
});

Cypress.Commands.add('registerTeams', () => {
    for (const team of TEAMS) {
        publicPost('/public/teams', team);
    }
    cy.clearAllCookies();
});

Cypress.Commands.add('createSchedule', () => {
    cy.adminApi('POST', '/admin/schedule/create/schedule', SCHEDULE);
    return cy.adminApi('GET', '/admin/schedule/rounds').then(response => {
        const rounds = response.body as BackendRound[];
        return [...rounds].sort((first, second) => first.roundNumber - second.roundNumber);
    });
});

export const gameOf = (round: BackendRound, teamName: string): BackendGame => {
    const game = round.games.find(candidate => candidate.teams.some(team => team.teamName === teamName));
    expect(game, `game of ${teamName} in round ${round.roundNumber}`).to.be.an('object');
    return game!;
};

export const playsIn = (round: BackendRound, teamName: string): boolean =>
    round.games.some(game => game.teams.some(team => team.teamName === teamName));

export const opponentsIn = (game: BackendGame, teamName: string): string[] =>
    game.teams.map(team => team.teamName).filter(name => name !== teamName);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            adminApi(method: Method, path: string, body?: RequestBody): Chainable<Response<unknown>>;
            resetBackend(options?: { open?: boolean }): Chainable<void>;
            registerTeams(): Chainable<void>;
            createSchedule(): Chainable<BackendRound[]>;
        }
    }
}

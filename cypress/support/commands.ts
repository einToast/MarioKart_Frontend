/// <reference types="cypress" />

// The E2E specs run against the real app in a real browser, but never against a real backend:
// every request to the API is answered by `cy.intercept`. `cy.stubBackend()` installs answers
// for the endpoints nearly every page calls; a spec overrides single endpoints afterwards with
// `cy.stubApi()`. Requests nobody stubbed are answered with 501 so that they show up in the
// command log instead of hanging

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface TeamFixture {
    id: number;
    teamName: string;
    character: { id: number; characterName: string };
    finalReady: boolean;
    active: boolean;
    groupPoints: number;
    finalPoints: number;
    numberOfGamesPlayed: number;
}

export const team = (id: number, name: string, overrides: Partial<TeamFixture> = {}): TeamFixture => ({
    id,
    teamName: `Team ${name}`,
    character: { id, characterName: name },
    finalReady: true,
    active: true,
    groupPoints: 0,
    finalPoints: 0,
    numberOfGamesPlayed: 0,
    ...overrides,
});

export const teams = (): TeamFixture[] => [team(1, 'Mario'), team(2, 'Luigi'), team(3, 'Peach'), team(4, 'Toad')];

// Where the app under test expects its backend, see README ("Testing")
const API_URL = 'http://localhost:8080/api';

const apiUrl = (path: string): string => `${API_URL}${path}`;

Cypress.Commands.add('stubApi', (method: Method, path: string, body?: unknown, statusCode = 200) => {
    return cy.intercept(method, apiUrl(path), { statusCode, body: body ?? '' });
});

Cypress.Commands.add('stubBackend', () => {
    cy.intercept(`${API_URL}/**`, { statusCode: 501, body: 'not stubbed' }).as('unstubbed');
    // SockJS probes this endpoint before opening the socket; the specs do not use live updates
    cy.intercept(apiUrl('/ws/**'), { statusCode: 503, body: '' });

    cy.stubApi('GET', '/public/settings', {
        tournamentOpen: true,
        registrationOpen: true,
        maxGamesCount: 8,
        surveyKeyMode: 'DISABLED',
        finalTeamsCount: 4,
        switches: [
            { name: 'Blau', color: '#9DAEDA' },
            { name: 'Rot', color: '#DA9DC9' },
            { name: 'Grün', color: '#9DDAAA' },
            { name: 'Weiß', color: '#ECECEC' },
        ],
        floorPlan: null,
    });
    cy.stubApi('GET', '/public/schedule/create/schedule', true);
    cy.stubApi('GET', '/public/schedule/create/final_schedule', false);
    cy.stubApi('GET', '/public/schedule/rounds/unplayed', 5);
    cy.stubApi('GET', '/public/schedule/rounds/current', []);
    cy.stubApi('GET', '/public/teams/sortedByTeamName', teams());
    cy.stubApi('GET', '/public/user/login/check', '', 401);
});

Cypress.Commands.add('loginAsTeam', (id = 1, name = 'Mario') => {
    cy.setCookie('user', encodeURIComponent(JSON.stringify({ teamId: id, name: `Team ${name}`, character: name })));
});

Cypress.Commands.add('loginAsAdmin', () => {
    cy.stubApi('GET', '/public/user/login/check', { user: { username: 'admin', isAdmin: true, ID: 1 } });
});

Cypress.Commands.add('toast', (message: string) => {
    return cy.get('ion-toast').shadow().contains(message);
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            // Answers one API endpoint (path relative to the API base URL) with the given body
            stubApi(method: Method, path: string, body?: unknown, statusCode?: number): Chainable<null>;
            // Answers the endpoints every page needs: open tournament, running group phase, no admin session
            stubBackend(): Chainable<void>;
            // Sets the cookie the app uses to remember the logged in team
            loginAsTeam(id?: number, name?: string): Chainable<void>;
            // Makes the admin session check succeed
            loginAsAdmin(): Chainable<void>;
            // Finds the toast showing the given message
            toast(message: string): Chainable<JQuery<HTMLElement>>;
        }
    }
}

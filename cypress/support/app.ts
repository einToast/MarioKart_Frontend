/// <reference types="cypress" />

import { BackendRound, TEAMS, playsIn } from './backend';

export const loginAsTeam = (teamName: string) => {
    cy.clearCookie('user');
    cy.visit('/login', {
        onBeforeLoad(win) {
            cy.spy(win.console, 'log').as('consoleLog');
        },
    });
    cy.chooseImageSelectOption(teamName);
    cy.contains('ion-button', `Zum Team ${teamName} anmelden`).click();
    cy.location('pathname').should('eq', '/tab1');
};

export const waitForLiveUpdates = () => cy.get('@consoleLog').should('be.calledWith', 'Connected to WebSocket');

export const asAdmin = (path: string) => {
    cy.get<string>('@adminToken').then(token => cy.setCookie('authToken', token));
    cy.visit(path);
};

export const section = (title: string) => cy.contains('h3', title).parents('.flexSpiel');

export const characterOf = (teamName: string) => TEAMS.find(team => team.teamName === teamName)!.characterName;

export const teamPlayingIn = (...rounds: BackendRound[]) =>
    TEAMS.map(team => team.teamName).find(name => rounds.every(round => playsIn(round, name)))!;

export const SURVEY = {
    questionText: 'Wer gewinnt?',
    questionType: 'MULTIPLE_CHOICE',
    options: ['Mario', 'Luigi', 'Peach'],
    active: true,
    visible: true,
    live: false,
    finalTeamsOnly: false,
    oneAnswerPerKey: false,
};

export interface BackendQuestion {
    id: number;
    questionText: string;
}

export const createSurvey = (overrides: Partial<typeof SURVEY> = {}) =>
    cy.adminApi('POST', '/admin/survey', { ...SURVEY, ...overrides })
        .then(response => response.body as BackendQuestion);

export const setPoints = (round: BackendRound, teamName: string, points: number) => {
    const game = round.games.find(candidate => candidate.teams.some(team => team.teamName === teamName))!;
    const team = game.teams.find(candidate => candidate.teamName === teamName)!;
    cy.adminApi('PUT', `/admin/schedule/rounds/${round.id}/games/${game.id}/teams/${team.id}/points`, { points });
};

export const changeBreak = (beforeRound: { id: number }, breakEnded = false) =>
    cy.adminApi('PUT', '/admin/schedule/break', { roundId: beforeRound.id, breakDuration: 30, breakEnded });

export const endBreak = () =>
    cy.adminApi('GET', '/admin/schedule/break').its('body.round').then(round => changeBreak(round as { id: number }, true));

export const markPlayed = (...rounds: BackendRound[]) => {
    for (const round of rounds) {
        cy.adminApi('PUT', `/admin/schedule/rounds/${round.id}`, { played: true });
    }
};

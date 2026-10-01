import { team } from '../support/commands';

const game = (id: number, switchGame: string, teams: ReturnType<typeof team>[]) => ({ id, switchGame, teams, points: null });

const rounds = () => [
  {
    id: 5, roundNumber: 5, startTime: '2025-01-08T17:45:00', endTime: '2025-01-08T18:05:00', finalGame: false, played: false,
    games: [
      game(51, 'Rot', [team(1, 'Mario'), team(2, 'Luigi')]),
      game(52, 'Blau', [team(3, 'Peach'), team(4, 'Toad')]),
    ],
  },
  {
    id: 6, roundNumber: 6, startTime: '2025-01-08T18:10:00', endTime: '2025-01-08T18:30:00', finalGame: false, played: false,
    games: [game(61, 'Grün', [team(3, 'Peach'), team(4, 'Toad')])],
  },
];

describe('team tabs', () => {
  beforeEach(() => {
    cy.stubBackend();
    cy.stubApi('GET', '/public/schedule/rounds/current', rounds());
    cy.stubApi('GET', '/public/teams/notInRound/5', []);
    cy.stubApi('GET', '/public/teams/notInRound/6', [team(1, 'Mario'), team(2, 'Luigi')]);
    cy.stubApi('GET', '/public/teams/sortedByGroupPoints', [
      team(2, 'Luigi', { groupPoints: 45, numberOfGamesPlayed: 4 }),
      team(1, 'Mario', { groupPoints: 30, numberOfGamesPlayed: 3 }),
    ]);
    cy.loginAsTeam(1, 'Mario');
  });

  it('shows the own games first and all games on request', () => {
    cy.visit('/tab1');

    cy.contains('h3', 'Aktuelles Spiel').parent().should('contain', '17:45 - 18:05');
    cy.contains('.teamContainer.userTeam', 'Team Mario').should('contain', 'Switch Rot');
    cy.contains('Switch Blau').should('not.exist');
    cy.contains('h3', 'Nächstes Spiel').parents('.flexSpiel').should('contain', 'Pause');

    cy.get('select').select('Alle Spiele');

    cy.contains('h3', 'Aktuelle Spiele');
    cy.contains('Switch Blau').should('exist');
    cy.get('body').should('have.class', 'all-games-selected');

    cy.reload();
    cy.get('select').should('have.value', 'Alle Spiele');
  });

  it('navigates between the tabs through the tab bar', () => {
    cy.visit('/tab1');

    cy.get('ion-tab-button[tab="tab2"]').click();
    cy.location('pathname').should('eq', '/tab2');
    cy.contains('h1', 'Rangliste');
    // Ionic keeps the schedule page in the DOM, so the ranking rows are addressed explicitly
    cy.contains('.flexContainer > .teamContainer', 'Team Luigi').should('contain', '1. Platz').and('contain', '4/8 Spiele');
    cy.contains('.flexContainer > .teamContainer.userTeam', 'Team Mario').should('contain', '2. Platz');

    cy.get('ion-tab-button[tab="tab3"]').click();
    cy.location('pathname').should('eq', '/tab3');
    cy.contains('h1', 'Details');
    cy.contains('ion-button', 'Benachrichtigungen aktivieren');

    cy.get('ion-tab-button[tab="tab4"]').click();
    cy.location('pathname').should('eq', '/tab4');
    cy.contains('h1', 'So wird gespielt');

    cy.get('ion-tab-button[tab="tab1"]').click();
    cy.location('pathname').should('eq', '/tab1');
  });

  it('hides the ranking during the last round of the group phase', () => {
    cy.stubApi('GET', '/public/schedule/rounds/unplayed', 1);

    cy.visit('/tab1');
    cy.get('ion-tab-bar ion-tab-button').should('have.length', 3);
    cy.get('ion-tab-button[tab="tab2"]').should('not.exist');

    cy.visit('/tab2');
    cy.location('pathname').should('eq', '/tab1');
  });

  it('lets a team answer a survey once', () => {
    cy.stubApi('GET', '/public/survey/visible', [{
      id: 7, questionText: 'Wer gewinnt?', questionType: 'MULTIPLE_CHOICE', options: ['Mario', 'Luigi', 'Peach'],
      active: true, visible: true, live: false, finalTeamsOnly: false, oneAnswerPerKey: false,
    }]);
    cy.stubApi('POST', '/public/survey/answer', { questionId: 7 }).as('answer');
    cy.visit('/tab1');

    cy.get('a[title="Umfragen"]').click();
    cy.location('pathname').should('eq', '/survey');

    cy.contains('ion-item', 'Wer gewinnt?').click();
    cy.contains('ion-button', 'Luigi').click();
    cy.contains('ion-button', 'Antwort speichern').click();

    cy.wait('@answer').its('request.body').should('deep.include', {
      questionId: 7,
      answerType: 'MULTIPLE_CHOICE',
      multipleChoiceSelectedOption: 1,
    });
    cy.contains('ion-button', 'Antwort speichern').should('not.exist');

    cy.reload();
    cy.contains('ion-item', 'Wer gewinnt?');
    cy.contains('ion-button', 'Antwort speichern').should('not.exist');
  });
});

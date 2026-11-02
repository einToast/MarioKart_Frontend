import { ADMIN, SWITCHES, TEAMS, gameOf, opponentsIn, playsIn } from '../support/backend';

const loginAsTeam = (teamName: string) => {
  cy.visit('/login', {
    onBeforeLoad(win) {
      cy.spy(win.console, 'log').as('consoleLog');
    },
  });
  cy.get('select').select(teamName);
  cy.contains('ion-button', `Zum Team ${teamName} anmelden`).click();
  cy.location('pathname').should('eq', '/tab1');
};

const waitForLiveUpdates = () => cy.get('@consoleLog').should('be.calledWith', 'Connected to WebSocket');

const section = (title: string) => cy.contains('h3', title).parents('.flexSpiel');

const showsGame = (title: string, game: { switchIndex: number }, teamName: string, opponents: string[]) => {
  section(title).should('contain', teamName).and('contain', `Switch ${SWITCHES[game.switchIndex].name}`);
  for (const opponent of opponents) {
    section(title).should('contain', opponent);
  }
};

describe('frontend with the real backend', () => {
  beforeEach(() => {
    cy.resetBackend();
  });

  it('logs the admin in with the bootstrap user and rejects a wrong password', () => {
    cy.visit('/admin/login');

    cy.get('input[name="username"]').type(ADMIN.username);
    cy.get('input[name="password"]').type('falsch');
    cy.contains('ion-button', 'Admin Bereich betreten').click();
    cy.toast('Nutzername oder Passwort ist falsch');
    cy.location('pathname').should('eq', '/admin/login');

    cy.get('input[name="password"]').clear().type(ADMIN.password);
    cy.contains('ion-button', 'Admin Bereich betreten').click();

    cy.location('pathname').should('eq', '/admin/dashboard');
    cy.contains('h1', 'Dashboard');
  });

  it('registers a team that the login then offers', () => {
    cy.visit('/register');

    cy.get('select').select('Yoshi');
    cy.get('input[placeholder="Teamname"]').type('Die Dinos');
    cy.contains('ion-button', 'Team registrieren').click();

    cy.location('pathname').should('eq', '/tab1');
    cy.get('.loggedInUserHead').should('contain', 'Die Dinos');

    cy.clearCookies();
    loginAsTeam('Die Dinos');
    cy.get('.loggedInUserHead').should('contain', 'Die Dinos');
  });

  it('shows a team its game from the generated schedule and follows the admin to the next round', () => {
    cy.registerTeams();
    cy.createSchedule().then(([first, second]) => {
      const team = TEAMS.map(candidate => candidate.teamName)
        .find(name => playsIn(first, name) && playsIn(second, name))!;
      const firstGame = gameOf(first, team);
      const secondGame = gameOf(second, team);
      cy.intercept('GET', '**/public/schedule/overview').as('overview');

      loginAsTeam(team);

      showsGame('Aktuelles Spiel', firstGame, team, opponentsIn(firstGame, team));
      showsGame('Nächstes Spiel', secondGame, team, opponentsIn(secondGame, team));
      cy.wait('@overview');
      waitForLiveUpdates();

      cy.adminApi('PUT', `/admin/schedule/rounds/${first.id}`, { played: true });

      cy.wait('@overview');
      showsGame('Aktuelles Spiel', secondGame, team, opponentsIn(secondGame, team));
    });
  });

  it('tells the teams that sit out a round that they pause', () => {
    cy.registerTeams();
    cy.createSchedule().then(([first]) => {
      const pausing = TEAMS.map(team => team.teamName).filter(name => !playsIn(first, name));
      expect(pausing, 'teams without a game in the first round').to.have.length(TEAMS.length - 16);

      loginAsTeam(pausing[0]);

      section('Aktuelles Spiel').should('contain', pausing[0]).and('contain', 'Pause');
    });
  });

  it('sends visitors to the login while the registration is closed', () => {
    cy.adminApi('PUT', '/admin/settings', { registrationOpen: false });

    cy.visit('/register');

    cy.location('pathname').should('eq', '/login');
  });

  it('keeps teams out while the tournament is closed', () => {
    cy.registerTeams();
    cy.adminApi('PUT', '/admin/settings', { tournamentOpen: false });

    cy.visit('/login');

    cy.get('input[name="username"]').should('be.visible');
  });

  it('counts the answer a team gives to a survey', () => {
    cy.registerTeams();
    cy.adminApi('POST', '/admin/survey', {
      questionText: 'Wer gewinnt?', questionType: 'MULTIPLE_CHOICE', options: ['Mario', 'Luigi', 'Peach'],
      active: true, visible: true, live: false, finalTeamsOnly: false, oneAnswerPerKey: false,
    }).then(response => {
      const questionId = (response.body as { id: number }).id;

      loginAsTeam('Team Mario');
      cy.get('a[title="Umfragen"]').click();
      cy.contains('ion-item', 'Wer gewinnt?').click();
      cy.contains('ion-button', 'Luigi').click();
      cy.contains('ion-button', 'Antwort speichern').click();
      cy.contains('ion-button', 'Antwort speichern').should('not.exist');

      cy.adminApi('GET', `/admin/survey/${questionId}/statistics`).its('body').should('deep.equal', [0, 1, 0]);
    });
  });

  it('clears the schedule on the team phones when the admin deletes it', () => {
    cy.registerTeams();
    cy.createSchedule().then(([first]) => {
      const team = first.games[0].teams[0].teamName;
      loginAsTeam(team);
      section('Aktuelles Spiel').should('contain', team);
    });
    waitForLiveUpdates();

    cy.adminApi('DELETE', '/admin/schedule/create/schedule');

    cy.contains('p', 'Keine Spiele gefunden.').should('be.visible');
    cy.contains('h3', 'Aktuelles Spiel').parents('.flexSpiel').should('not.exist');
  });

  it('ranks the teams by the points the admin entered', () => {
    cy.registerTeams();
    cy.createSchedule().then(([first]) => {
      const winner = first.games.flatMap(game => game.teams).find(team => team.teamName !== 'Team Mario')!.teamName;
      cy.wrap(winner).as('winner');
      for (const game of first.games) {
        for (const team of game.teams) {
          const points = team.teamName === winner ? 40 : 20;
          cy.adminApi('PUT', `/admin/schedule/rounds/${first.id}/games/${game.id}/teams/${team.id}/points`, { points });
        }
      }
      cy.adminApi('PUT', `/admin/schedule/rounds/${first.id}`, { played: true });
    });

    loginAsTeam('Team Mario');
    cy.get('ion-tab-button[tab="tab2"]').click();

    cy.contains('h1', 'Rangliste');
    cy.get<string>('@winner').then(winner => {
      cy.contains('.flexContainer > .teamContainer', winner).should('contain', '1. Platz');
    });
    cy.contains('.flexContainer > .teamContainer.userTeam', 'Team Mario').should('not.contain', '1. Platz');
  });
});

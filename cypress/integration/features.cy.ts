import { ADMIN, SWITCHES, TEAMS, gameOf, opponentsIn, playsIn } from '../support/backend';
import {
  asAdmin, characterOf, createSurvey, endBreak, loginAsTeam, markPlayed, section, setPoints, SURVEY, waitForLiveUpdates,
} from '../support/app';

const showsGame = (title: string, game: { switchIndex: number }, teamName: string, opponents: string[]) => {
  section(title).should('contain', teamName).and('contain', `Switch ${SWITCHES[game.switchIndex].name}`);
  for (const opponent of opponents) {
    section(title).should('contain', opponent);
  }
};

const finalist = (teamName: string) => cy.contains('.teamFinalContainer .teamContainer', teamName);

const editSurvey = (questionText: string) => {
  asAdmin('/admin/survey');
  cy.contains('.currentSurvey', questionText).find('[title="Umfrage ändern"]').click();
};

const surveyQuestionInput = () => cy.contains('ion-modal .borderContainer p', /^Frage der Umfrage$/).siblings('input');

const surveyOptionInput = (number: number) =>
  cy.contains('ion-modal .form-group label', new RegExp(`^Option ${number}$`)).siblings('input');

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

    cy.chooseImageSelectOption('Yoshi');
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
    createSurvey().then(question => {
      loginAsTeam('Team Mario');
      cy.get('a[title="Umfragen"]').click();
      cy.contains('ion-item', 'Wer gewinnt?').click();
      cy.contains('ion-button', 'Luigi').click();
      cy.contains('ion-button', 'Antwort speichern').click();
      cy.contains('ion-button', 'Antwort speichern').should('not.exist');

      cy.adminApi('GET', `/admin/survey/${question.id}/statistics`).its('body').should('deep.equal', [0, 1, 0]);
    });
  });

  it('lets the admin reword a survey and delete it again', () => {
    cy.registerTeams();
    createSurvey();

    editSurvey('Wer gewinnt?');
    surveyQuestionInput().clear().type('Wer gewinnt heute?');
    surveyOptionInput(3).clear().type('Yoshi');
    cy.get('ion-modal').contains('ion-button', 'Umfrage ändern').click();
    cy.toast('Umfrage erfolgreich geändert');
    cy.contains('.currentSurvey', 'Wer gewinnt heute?');

    loginAsTeam('Team Mario');
    cy.get('a[title="Umfragen"]').click();
    cy.contains('ion-accordion', 'Wer gewinnt heute?').should('contain', 'Yoshi').and('not.contain', 'Peach');

    asAdmin('/admin/survey');
    cy.contains('.currentSurvey', 'Wer gewinnt heute?').find('[title="Umfrage löschen"]').click();
    cy.get('ion-modal').contains('ion-button', 'Umfrage löschen').click();
    cy.toast('Umfrage erfolgreich gelöscht');
    cy.contains('.currentSurvey', 'Wer gewinnt heute?').should('not.exist');

    cy.visit('/survey');
    cy.contains('p', 'Gerade finden keine Umfragen statt.');
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

  it('explains why the admin cannot create a schedule', () => {
    cy.registerTeams();
    asAdmin('/admin/schedule');

    cy.get('#switchCount').clear().type('6');
    cy.contains('Mindestens 24 Teams nötig');
    cy.contains('ion-button', 'Spielplan erstellen').click();
    cy.toast('Nicht genügend Teams vorhanden (mindestens Spielfelder x Teams pro Spiel)');
    cy.location('pathname').should('eq', '/admin/schedule');

    cy.createSchedule();
    cy.get('#switchCount').clear().type(String(SWITCHES.length));
    cy.contains('ion-button', 'Spielplan erstellen').click();
    cy.toast('Spielplan existiert bereits');
    cy.location('pathname').should('eq', '/admin/schedule');
  });

  it('greys out a team the admin deactivated and leaves it out of the final', () => {
    cy.registerTeams();
    cy.createSchedule().then(([first]) => {
      const [viewer, inactive] = first.games[0].teams.map(team => team.teamName);
      setPoints(first, inactive, 40);

      asAdmin('/admin/final');
      finalist(inactive);

      asAdmin('/admin/teams');
      cy.contains('.teamContainer', inactive).find('[title="Team deaktivieren"]').click();
      cy.contains('.teamContainer', inactive).find('[title="Team aktivieren"]');

      asAdmin('/admin/final');
      cy.get('.teamFinalContainer .teamContainer').should('have.length', 4);
      finalist(inactive).should('not.exist');

      asAdmin('/admin/points');
      cy.get('select#round').select('Runde 1');
      cy.get('.characterInput').filter(`:has(img[alt="${characterOf(inactive)}"])`)
        .should('have.class', 'inactiveTeam')
        .find('input').should('be.enabled');
      cy.get('.characterInput').filter(`:has(img[alt="${characterOf(viewer)}"])`)
        .should('not.have.class', 'inactiveTeam');

      loginAsTeam(viewer);
      section('Aktuelles Spiel').contains('.teamContainer', inactive).should('have.css', 'opacity', '0.5');
      section('Aktuelles Spiel').contains('.teamContainer', viewer).should('have.css', 'opacity', '1');
    });
  });

  it('refuses the final while group rounds are unplayed', () => {
    cy.registerTeams();
    cy.createSchedule();

    asAdmin('/admin/final');
    cy.contains('ion-button', 'Finalspiele erstellen').click();

    cy.toast('Noch nicht alle Runden gespielt');
    cy.location('pathname').should('eq', '/admin/final');
  });

  it('brings excluded teams back into the final and sends the other teams to a pause', () => {
    cy.registerTeams();
    cy.createSchedule().then(rounds => {
      const ranked = rounds[0].games.flatMap(game => game.teams).map(team => team.teamName);
      ranked.forEach((teamName, index) => setPoints(rounds[0], teamName, 40 - index));
      endBreak();
      markPlayed(...rounds);
      const [leader, , , fourth, fifth] = ranked;
      const sittingOut = TEAMS.map(team => team.teamName).find(name => !ranked.includes(name))!;

      asAdmin('/admin/final');
      cy.get('.teamFinalContainer .teamContainer').should('have.length', 4);
      finalist(leader);
      finalist(fifth).should('not.exist');

      finalist(leader).find('[title="Team nicht am Finale teilnehmen lassen"]').click();
      finalist(leader).should('not.exist');
      finalist(fifth);

      cy.contains('ion-button', 'Teams zurücksetzen').click();
      cy.toast('Teams zurückgesetzt');
      finalist(leader);
      finalist(fourth);
      finalist(fifth).should('not.exist');

      cy.contains('ion-button', 'Finalspiele erstellen').click();
      cy.location('pathname').should('eq', '/admin/dashboard');

      loginAsTeam(sittingOut);
      section('Aktuelles Spiel').should('contain', sittingOut).and('contain', 'Pause').and('not.contain', 'Switch');
      loginAsTeam(leader);
      section('Aktuelles Spiel').should('contain', fourth).and('contain', `Switch ${SWITCHES[0].name}`);
    });
  });

  it('shows the texts the admin translated to a team that reads English', () => {
    cy.registerTeams();
    createSurvey();

    asAdmin('/admin/program');
    cy.get('.programRow').then(rows => {
      for (let row = 0; row < rows.length; row++) {
        cy.get('button[aria-label="Programmpunkt 1 entfernen"]').click();
      }
    });
    cy.contains('p', 'Keine Programmpunkte.');
    [['16:00 - 16:30', 'Begrüßung'], ['20:00 - 20:45', 'Siegerehrung']].forEach(([time, text], index) => {
      cy.contains('button', '+ Programmpunkt hinzufügen').click();
      cy.get(`input[aria-label="Zeit von Programmpunkt ${index + 1}"]`).type(time);
      cy.get(`input[aria-label="Text von Programmpunkt ${index + 1}"]`).type(text);
    });
    cy.contains('.translationLanguages button', 'English').click();
    cy.get('input[aria-label="Text von Programmpunkt 1"]').should('have.value', '').type('Welcome');
    cy.contains('ion-button', 'Speichern').click();
    cy.toast('Programm gespeichert');

    editSurvey('Wer gewinnt?');
    cy.get('ion-modal').contains('.translationLanguages button', 'English').click();
    surveyQuestionInput().should('have.value', '').type('Who wins?');
    surveyOptionInput(3).type('Princess Peach');
    cy.get('ion-modal').contains('ion-button', 'Umfrage ändern').click();
    cy.toast('Umfrage erfolgreich geändert');

    loginAsTeam('Team Mario');
    cy.get('.languageSwitchToggle').filter(':visible').click();
    cy.contains('.languageSwitchMenu button', 'English').click();
    cy.contains('h3', 'Current game');

    cy.get('ion-tab-button[tab="tab3"]').click();
    cy.contains('h3', 'Program');
    cy.contains('p', '16:00 - 16:30').should('contain', 'Welcome');
    cy.contains('p', '20:00 - 20:45').should('contain', 'Siegerehrung');

    cy.get('a[title="Surveys"]').filter(':visible').click();
    cy.contains('ion-accordion', 'Who wins?').should('contain', 'Luigi').and('contain', 'Princess Peach');

    cy.reload();
    cy.contains('ion-accordion', 'Who wins?');
  });

  it('moves the texts into English when the admin makes it the default language', () => {
    cy.registerTeams();
    cy.adminApi('POST', '/admin/survey', {
      ...SURVEY,
      translations: { en: { questionText: 'Who wins?', options: ['', '', 'Princess Peach'] } },
    });
    cy.adminApi('PUT', '/admin/settings', {
      program: JSON.stringify({
        entries: [
          { icon: 'megaphone', time: '16:00 - 16:30', text: 'Begrüßung', translations: { en: { text: 'Welcome' } } },
          { icon: 'medal', time: '20:00 - 20:45', text: 'Siegerehrung' },
        ],
      }),
    });

    cy.setCookie('language', 'de');
    asAdmin('/admin/control');
    cy.contains('ion-button', 'Turniereinstellungen').click();
    cy.get('ion-modal .languageField .languageSwitchToggle').click();
    cy.get('ion-modal .languageSwitchMenu').contains('button', 'English').click();
    cy.get('ion-modal').contains('ion-button', 'Speichern').click();
    cy.toast('Einstellungen gespeichert');

    asAdmin('/admin/program');
    cy.get('.translationLanguages button').first().should('have.text', 'English (Standard)');
    cy.get('input[aria-label="Text von Programmpunkt 1"]').should('have.value', 'Welcome');

    // A team that never picked a language reads the app in the new default language
    cy.clearAllCookies();
    cy.visit('/login');
    cy.chooseImageSelectOption('Team Mario');
    cy.contains('ion-button', 'Log in to team Team Mario').click();
    cy.contains('h3', 'Current game');
    cy.get('ion-tab-button[tab="tab3"]').click();
    cy.contains('p', '16:00 - 16:30').should('contain', 'Welcome');
    cy.contains('p', '20:00 - 20:45').should('contain', 'Siegerehrung');
    cy.get('a[title="Surveys"]').filter(':visible').click();
    cy.contains('ion-accordion', 'Who wins?').should('contain', 'Luigi').and('contain', 'Princess Peach');

    // The former German texts stay as translation
    cy.get('.languageSwitchToggle').filter(':visible').click();
    cy.contains('.languageSwitchMenu button', 'Deutsch').click();
    cy.contains('ion-accordion', 'Wer gewinnt?').should('contain', 'Peach').and('not.contain', 'Princess');
    cy.get('ion-tab-button[tab="tab3"]').click();
    cy.contains('p', '16:00 - 16:30').should('contain', 'Begrüßung');
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

import { ADMIN, API_URL, BackendRound, BackendTeam, SCHEDULE, SWITCHES, TEAMS, playsIn } from '../support/backend';

interface RankedTeam extends BackendTeam {
  character: { characterName: string };
  groupPoints: number;
  numberOfGamesPlayed: number;
  finalReady: boolean;
}

interface Question {
  id: number;
  questionText: string;
  options: string[];
}

const TEAM_NAMES = TEAMS.map(team => team.teamName);

const GROUP_POINTS: Record<string, number> = Object.fromEntries(
  TEAMS.map((team, index) => [team.characterName, 10 + index]));

const GROUP_WINNER = TEAMS[TEAMS.length - 1];
const [FIRST, SECOND, THIRD, FOURTH] = TEAMS.slice(-5, -1).reverse();
const FINAL_POINTS: Record<string, number> = {
  [FIRST.characterName]: 10,
  [SECOND.characterName]: 8,
  [THIRD.characterName]: 12,
  [FOURTH.characterName]: 15,
};
const FINAL_ORDER = [FOURTH, THIRD, FIRST, SECOND].map(team => team.teamName);

const MISSPELLED = { teamName: 'Team Waluigii', characterName: 'Waluigi' };
const NO_SHOW = { teamName: 'Team Toadette', characterName: 'Toadette' };

const PROGRAM = [
  { time: '16:00 - 16:30', text: 'Begrüßung und Registrierung' },
  { time: '16:30 - 20:00', text: 'Gruppenphase mit Pizzapause' },
  { time: '20:00 - 20:45', text: 'Finale und Siegerehrung' },
];

const TRACK_QUESTION = 'Welche Strecke fahrt ihr am liebsten?';
const TRACKS = ['Regenbogen-Boulevard', 'Toads Fabrik', 'Wario-Stadion', 'Kokos-Promenade'];
const TRACK_VOTES = [TRACKS[0], TRACKS[2], TRACKS[0], TRACKS[3], TRACKS[0], TRACKS[2]];

const ITEM_QUESTION = 'Welche Items mögt ihr?';
const ITEMS = ['Panzer', 'Banane', 'Pilz', 'Blitz'];

const FEEDBACK_QUESTION = 'Wie gefällt euch das Turnier?';
const MOTTO_QUESTION = 'Wie lautet euer Team-Motto?';

const FINAL_QUESTION = 'Wer gewinnt das Finale?';
const FINAL_VOTES = [FOURTH, FOURTH, FIRST, FOURTH, THIRD].map(team => team.teamName);

const loginAsAdmin = () => {
  cy.visit('/admin/login');
  cy.get('input[name="username"]').type(ADMIN.username);
  cy.get('input[name="password"]').type(ADMIN.password);
  cy.contains('ion-button', 'Admin Bereich betreten').click();
  cy.location('pathname').should('eq', '/admin/dashboard');
};

const asAdmin = (path: string) => {
  cy.getCookie('authToken').then(cookie => {
    if (!cookie) {
      loginAsAdmin();
    }
  });
  cy.visit(path);
};

const confirmInControlCentre = (action: string) => {
  asAdmin('/admin/control');
  cy.contains('ion-button', action).click();
  cy.get('ion-modal').contains('ion-button', action).click();
  cy.contains('.adminDashboard ion-button', action).should('not.exist');
};

const changeBreak = (change: { beforeRound?: BackendRound; ended?: boolean }) => {
  cy.intercept('PUT', '**/admin/schedule/break').as('breakChanged');
  asAdmin('/admin/control');
  cy.contains('ion-button', 'Pause ändern').click();
  if (change.beforeRound) {
    cy.get('ion-modal').contains('.borderContainer', 'Vor Runde').find('select').select(String(change.beforeRound.id));
  }
  if (change.ended) {
    cy.get('ion-modal').contains('.borderContainer', 'Pause beendet').find('select').select('Ja');
  }
  cy.get('ion-modal').contains('ion-button', 'Pause ändern').click();
  cy.wait('@breakChanged').its('response.statusCode').should('eq', 200);
};

const sendNotification = (title: string, message: string, teamName?: string) => {
  cy.intercept('POST', '**/admin/notification/send*').as('allNotified');
  cy.intercept('POST', '**/admin/notification/send/*').as('teamNotified');
  asAdmin('/admin/control');
  cy.contains('ion-button', 'Benachrichtigung senden').click();
  if (teamName) {
    cy.get('ion-modal select').select(teamName);
  }
  cy.get('ion-modal input[placeholder="Titel eingeben"]').type(title);
  cy.get('ion-modal input[placeholder="Nachricht eingeben"]').type(message);
  cy.get('ion-modal').contains('ion-button', 'Benachrichtigung senden').click();
  cy.wait(teamName ? '@teamNotified' : '@allNotified').its('response.statusCode').should('eq', 200);
};

const registerInApp = (teamName: string, characterName: string) => {
  cy.clearCookie('user');
  cy.visit('/register');
  cy.get('select').select(characterName);
  cy.get('input[placeholder="Teamname"]').type(teamName);
  cy.contains('ion-button', 'Team registrieren').click();
  cy.location('pathname').should('eq', '/tab1');
};

const loginAsTeam = (teamName: string) => {
  cy.clearCookie('user');
  cy.visit('/login');
  cy.get('select').select(teamName);
  cy.contains('ion-button', `Zum Team ${teamName} anmelden`).click();
  cy.location('pathname').should('eq', '/tab1');
};

const onNewPhone = (teamName: string) => {
  cy.clearAllCookies();
  loginAsTeam(teamName);
};

const scoreRound = (round: string, pointsByCharacter: Record<string, number>, played = true) => {
  asAdmin('/admin/points');
  cy.get('select#round').select(round);
  cy.get('ion-accordion').its('length').then(games => {
    for (let game = 0; game < games; game++) {
      cy.get('ion-accordion').eq(game).should(accordion => {
        if (accordion.hasClass('accordion-collapsed')) {
          accordion.find('ion-item[slot="header"]')[0].click();
        }
        expect(accordion).to.have.class('accordion-expanded');
      });
      cy.get('ion-accordion').eq(game).find('.characterInput').its('length').then(players => {
        for (let player = 0; player < players; player++) {
          cy.get('ion-accordion').eq(game).find('.characterInput').eq(player).find('img').invoke('attr', 'src')
            .then(src => {
              const characterName = decodeURIComponent(String(src)).replace('/characters/', '').replace('.webp', '');
              cy.get('ion-accordion').eq(game).find('.characterInput').eq(player).find('input')
                .clear().type(String(pointsByCharacter[characterName]));
            });
        }
      });
    }
  });
  if (played) {
    cy.contains('ion-checkbox', 'Runde gespielt').click();
  }
  cy.contains('ion-button', 'Punkte speichern').click();
  cy.toast('Runde erfolgreich gespeichert');
};

const surveyItem = (questionText: string) => cy.contains('.currentSurvey', questionText);

const TOGGLED: Record<string, string> = {
  'Umfrage sichtbar machen': 'Umfrage unsichtbar machen',
  'Umfrage unsichtbar machen': 'Umfrage sichtbar machen',
  'Teilnahme aktivieren': 'Teilnahme deaktivieren',
  'Teilnahme deaktivieren': 'Teilnahme aktivieren',
};

const toggleQuestion = (questionText: string, toggle: string) => {
  surveyItem(questionText).then(item => {
    if (item.find(`[title="${toggle}"]`).length === 0) {
      return;
    }
    cy.intercept('PUT', '**/admin/survey/*').as('questionChanged');
    cy.wrap(item).find(`[title="${toggle}"]`).click();
    cy.wait('@questionChanged').its('response.statusCode').should('eq', 200);
  });
  surveyItem(questionText).find(`[title="${TOGGLED[toggle]}"]`).should('exist');
};

const createQuestion = (questionText: string, questionType: string,
  { options = [], finalTeamsOnly = false, oneAnswerPerKey = false }: {
    options?: string[]; finalTeamsOnly?: boolean; oneAnswerPerKey?: boolean;
  } = {}) => {
  asAdmin('/admin/survey');
  cy.contains('button.newSurvey', 'Neue Abstimmung').click();
  cy.get('ion-modal input[placeholder="Frage eingeben"]').type(questionText);
  cy.get('ion-modal').contains('.borderContainer', 'Abstimmungsoptionen').find('select').select(questionType);
  options.forEach((option, index) => {
    cy.get(`ion-modal input[placeholder="Option ${index + 1} eingeben"]`).type(option);
  });
  if (oneAnswerPerKey) {
    cy.get('ion-modal').contains('.borderContainer', 'Antworten pro Gerät').find('select').select('true');
  }
  if (finalTeamsOnly) {
    cy.get('ion-modal').contains('.borderContainer', 'Teamauswahl').find('select').select('true');
  }
  cy.get('ion-modal').contains('ion-button', 'Umfrage speichern').click();
  toggleQuestion(questionText, 'Umfrage sichtbar machen');
  toggleQuestion(questionText, 'Teilnahme aktivieren');
  surveyItem(questionText).find('[title="Teilnahme deaktivieren"]');
};

const closeQuestion = (questionText: string) => {
  asAdmin('/admin/survey');
  toggleQuestion(questionText, 'Teilnahme deaktivieren');
  toggleQuestion(questionText, 'Umfrage unsichtbar machen');
  surveyItem(questionText).find('[title="Umfrage sichtbar machen"]');
};

const setSurveyKeyMode = (mode: 'Aus' | 'Schlüssel verteilen' | 'Nur mit Schlüssel', message: string) => {
  asAdmin('/admin/survey');
  cy.contains('p', 'Umfrage-Schlüssel').parent().find('select').select(mode);
  cy.toast(message);
};

const answer = (questionText: string, choose: () => void) => {
  cy.intercept('POST', '**/public/survey/answer').as('answer');
  cy.get('a[title="Umfragen"]').click();
  cy.contains('ion-accordion', questionText).within(() => {
    cy.get('ion-item[slot="header"]').click();
    choose();
    cy.contains('ion-button', /speichern/i).click();
  });
  return cy.wait('@answer').its('response.statusCode');
};

const pick = (...options: string[]) => () => {
  for (const option of options) {
    cy.contains('ion-button', option).click();
  }
};

const write = (text: string) => () => {
  cy.get('textarea').type(text);
};

const questionNamed = (questionText: string) =>
  cy.adminApi('GET', '/admin/survey').its('body')
    .then(body => (body as Question[]).find(question => question.questionText === questionText)!);

const statisticsOf = (questionText: string) =>
  questionNamed(questionText).then(question =>
    cy.adminApi('GET', `/admin/survey/${question.id}/statistics`).its('body')
      .then(statistics => ({ options: question.options, statistics: statistics as number[] })));

const countVotes = (options: string[], votes: string[]) =>
  options.map(option => votes.filter(vote => vote === option).length);

const showView = (view: string) => {
  cy.contains('.ion-page:not(.ion-page-hidden) .flexStart', 'Spielplan').find('select').select(view, { force: true });
};

const currentGame = () => cy.contains('h3', 'Aktuelles Spiel').parents('.flexSpiel');

const teamPlayingIn = (...rounds: BackendRound[]) =>
  TEAM_NAMES.find(name => rounds.every(round => playsIn(round, name)))!;

const rankingTab = () => cy.get('ion-tab-button[tab="tab2"]');

describe('a whole tournament', () => {
  beforeEach(() => {
    cy.resetBackend({ open: false });
  });

  it('runs a whole evening with 21 teams and every feature of the app', () => {
    loginAsAdmin();

    asAdmin('/admin/venue');
    cy.contains('button', 'Entfernen').click();
    cy.get('input[aria-label="Name der Switch 4"]').should('not.exist');
    cy.contains('button', '+ Switch hinzufügen').click();
    cy.get('input[aria-label="Name der Switch 4"]').clear().type(SWITCHES[3].name);
    cy.contains('button', '+ Tisch').click();
    cy.contains('ion-button', 'Speichern').click();
    cy.toast('Switches und Raumplan gespeichert');

    asAdmin('/admin/program');
    cy.get('.programRow').then(rows => {
      for (let row = 0; row < rows.length; row++) {
        cy.get('button[aria-label="Programmpunkt 1 entfernen"]').click();
      }
    });
    cy.contains('p', 'Keine Programmpunkte.');
    PROGRAM.forEach((entry, index) => {
      cy.contains('button', '+ Programmpunkt hinzufügen').click();
      cy.get(`input[aria-label="Zeit von Programmpunkt ${index + 1}"]`).type(entry.time);
      cy.get(`input[aria-label="Text von Programmpunkt ${index + 1}"]`).type(entry.text);
    });
    cy.contains('ion-button', 'Speichern').click();
    cy.toast('Programm gespeichert');

    asAdmin('/admin/final');
    cy.get('#finalTeamsCount').should('have.value', '4');

    confirmInControlCentre('Turnier öffnen');
    confirmInControlCentre('Registrierung öffnen');

    for (const team of TEAMS) {
      const registered = team.characterName === MISSPELLED.characterName ? MISSPELLED : team;
      registerInApp(registered.teamName, registered.characterName);
    }
    registerInApp(NO_SHOW.teamName, NO_SHOW.characterName);

    cy.clearCookie('user');
    cy.visit('/register');
    cy.get(`select option[value="${TEAMS[0].characterName}"]`).should('not.exist');
    cy.get(`select option[value="${NO_SHOW.characterName}"]`).should('not.exist');

    asAdmin('/admin/teams');
    cy.contains('.teamContainer', MISSPELLED.teamName).find('[title="Team bearbeiten"]').click();
    cy.get('ion-modal input[placeholder="Name eingeben"]').clear().type('Team Waluigi');
    cy.get('ion-modal').contains('ion-button', 'Team ändern').click();
    cy.contains('.teamContainer', MISSPELLED.teamName).should('not.exist');
    cy.contains('.teamContainer', 'Team Waluigi');

    cy.contains('.teamContainer', NO_SHOW.teamName).find('[title="Team löschen"]').click();
    cy.get('ion-modal').contains('ion-button', 'Team löschen').click();
    cy.contains('.teamContainer', NO_SHOW.teamName).should('not.exist');

    cy.clearCookie('user');
    cy.visit('/register');
    cy.get(`select option[value="${NO_SHOW.characterName}"]`).should('exist');

    confirmInControlCentre('Registrierung schließen');
    cy.clearCookie('user');
    cy.visit('/register');
    cy.location('pathname').should('eq', '/login');
    cy.get('select option').should('have.length.at.least', TEAMS.length);

    asAdmin('/admin/schedule');
    cy.get('#scheduleVersion').select(`v${SCHEDULE.version}`);
    cy.get('#switchCount').clear().type(String(SCHEDULE.numFields));
    cy.get('#roundCount').clear().type(String(SCHEDULE.numRounds));
    cy.get('#teamsPerGame').clear().type(String(SCHEDULE.teamsPerGame));
    cy.contains('ion-button', 'Spielplan erzeugen').click();
    cy.toast('Spielplan erfolgreich erstellt');

    cy.adminApi('GET', '/admin/schedule/rounds').its('body').then(body => {
      const rounds = [...body as BackendRound[]].sort((first, second) => first.roundNumber - second.roundNumber);
      expect(rounds).to.have.length(SCHEDULE.numRounds);
      for (const round of rounds) {
        expect(round.games, `games in round ${round.roundNumber}`).to.have.length(SCHEDULE.numFields);
        expect(round.games.flatMap(game => game.teams), `teams in round ${round.roundNumber}`).to.have.length(16);
      }
      cy.wrap(rounds).as('rounds');
    });
    cy.adminApi('GET', '/admin/schedule/break').its('body.round.roundNumber').should('eq', 6);

    cy.get<BackendRound[]>('@rounds').then(rounds => {
      const playing = teamPlayingIn(rounds[0]);
      const pausing = TEAM_NAMES.find(name => !playsIn(rounds[0], name))!;

      loginAsTeam(playing);
      currentGame().should('contain', playing).and('contain', 'Switch');
      showView('Alle Spiele');
      cy.contains('h3', 'Aktuelle Spiele').parents('.flexSpiel').within(() => {
        for (const gameSwitch of SWITCHES) {
          cy.contains(`Switch ${gameSwitch.name}`);
        }
      });
      showView('Deine Spiele');

      loginAsTeam(pausing);
      currentGame().should('contain', pausing).and('contain', 'Pause');

      cy.get('ion-tab-button[tab="tab3"]').click();
      cy.contains('h3', 'Programm');
      for (const entry of PROGRAM) {
        cy.contains(entry.text);
      }
      cy.contains('h3', 'Raumplan');
      cy.get('ion-tab-button[tab="tab4"]').click();
      cy.contains('h2', 'Spielregeln');
    });

    sendNotification('Willkommen!', 'Das Turnier beginnt, viel Spaß!');
    sendNotification('Bitte zur Anmeldung', 'Kommt kurz zum Orga-Tisch.', TEAMS[2].teamName);

    createQuestion(TRACK_QUESTION, 'MULTIPLE_CHOICE', { options: TRACKS });
    TRACK_VOTES.forEach((track, index) => {
      onNewPhone(TEAM_NAMES[index]);
      answer(TRACK_QUESTION, pick(track)).should('eq', 200);
    });
    closeQuestion(TRACK_QUESTION);
    statisticsOf(TRACK_QUESTION).then(({ statistics }) => {
      expect(statistics).to.deep.equal(countVotes(TRACKS, TRACK_VOTES));
    });

    scoreRound('Runde 1', GROUP_POINTS);
    scoreRound('Runde 2', GROUP_POINTS);

    loginAsTeam(TEAM_NAMES[0]);
    rankingTab().click();
    cy.contains('h1', 'Rangliste');
    cy.contains('.flexContainer > .teamContainer.userTeam', TEAM_NAMES[0]).should('contain', 'Spiele');

    setSurveyKeyMode('Schlüssel verteilen', 'Geräte erhalten bei ihrer ersten Antwort einen Umfrage-Schlüssel');
    createQuestion(ITEM_QUESTION, 'CHECKBOX', { options: ITEMS, oneAnswerPerKey: true });

    onNewPhone(TEAM_NAMES[0]);
    answer(ITEM_QUESTION, pick(ITEMS[0], ITEMS[2])).should('eq', 200);
    cy.getCookie('surveyKey').should('exist').then(surveyKey => {
      cy.wrap(surveyKey!.value).as('surveyKey');
    });
    cy.getCookies().then(cookies => {
      for (const cookie of cookies.filter(candidate => candidate.name !== 'surveyKey')) {
        cy.clearCookie(cookie.name);
      }
    });
    loginAsTeam(TEAM_NAMES[1]);
    answer(ITEM_QUESTION, pick(ITEMS[1])).should('be.gte', 400);

    onNewPhone(TEAM_NAMES[1]);
    answer(ITEM_QUESTION, pick(ITEMS[0], ITEMS[3])).should('eq', 200);
    closeQuestion(ITEM_QUESTION);
    statisticsOf(ITEM_QUESTION).its('statistics').should('deep.equal', [2, 0, 1, 1]);

    setSurveyKeyMode('Nur mit Schlüssel', 'Nur Geräte mit Umfrage-Schlüssel können abstimmen');
    createQuestion(FEEDBACK_QUESTION, 'FREE_TEXT');
    onNewPhone(TEAM_NAMES[2]);
    answer(FEEDBACK_QUESTION, write('Ohne Schlüssel')).should('eq', 403);
    cy.get<string>('@surveyKey').then(surveyKey => {
      cy.clearAllCookies();
      cy.setCookie('surveyKey', surveyKey);
    });
    loginAsTeam(TEAM_NAMES[2]);
    answer(FEEDBACK_QUESTION, write('Super Stimmung, gerne wieder!')).should('eq', 200);
    setSurveyKeyMode('Aus', 'Umfrage-Schlüssel deaktiviert, alle können abstimmen');
    surveyItem(FEEDBACK_QUESTION).find('[title="Ergebnisse anzeigen"]').click();
    cy.get('ion-modal').should('contain', 'Ergebnisse: 1 Antworten').and('contain', 'Super Stimmung, gerne wieder!');
    cy.get('ion-modal').should('not.contain', 'Ohne Schlüssel');
    closeQuestion(FEEDBACK_QUESTION);

    createQuestion(MOTTO_QUESTION, 'TEAM_ONE_FREE_TEXT');
    onNewPhone(TEAM_NAMES[3]);
    answer(MOTTO_QUESTION, write('Bananen voraus!')).should('eq', 200);
    onNewPhone(TEAM_NAMES[3]);
    answer(MOTTO_QUESTION, write('Noch ein Motto')).should('eq', 429);
    closeQuestion(MOTTO_QUESTION);

    scoreRound('Runde 3', GROUP_POINTS);
    cy.get<BackendRound[]>('@rounds').then(rounds => {
      const mistyped = TEAMS.find(team => team.teamName === rounds[3].games[0].teams[0].teamName)!;
      scoreRound('Runde 4', { ...GROUP_POINTS, [mistyped.characterName]: 1 });
      cy.adminApi('GET', '/admin/teams/sortedByFinalPoints').its('body').then(body => {
        const team = (body as RankedTeam[]).find(candidate => candidate.teamName === mistyped.teamName)!;
        expect(team.groupPoints).to.be.lessThan(GROUP_POINTS[mistyped.characterName] * team.numberOfGamesPlayed);
      });
      scoreRound('Runde 4', GROUP_POINTS, false);
    });
    scoreRound('Runde 5', GROUP_POINTS);

    cy.get<BackendRound[]>('@rounds').then(rounds => {
      const team = teamPlayingIn(rounds[5], rounds[6]);

      loginAsTeam(team);
      currentGame().should('contain', "It's pizza time!");

      changeBreak({ beforeRound: rounds[6] });
      cy.adminApi('GET', '/admin/schedule/break').its('body.round.roundNumber').should('eq', 7);
      loginAsTeam(team);
      currentGame().should('contain', team).and('not.contain', "It's pizza time!");

      scoreRound('Runde 6', GROUP_POINTS);
      loginAsTeam(team);
      currentGame().should('contain', "It's pizza time!");

      sendNotification('Pizza ist da!', 'Holt euch euer Stück am Buffet.');
      changeBreak({ ended: true });
      loginAsTeam(team);
      currentGame().should('contain', team).and('not.contain', "It's pizza time!");
    });

    scoreRound('Runde 7', GROUP_POINTS);
    loginAsTeam(TEAM_NAMES[0]);
    cy.contains('h3', 'Aktuelles Spiel');
    rankingTab().should('not.exist');

    scoreRound('Runde 8', GROUP_POINTS);

    cy.adminApi('GET', '/admin/teams/sortedByFinalPoints').its('body').then(body => {
      const teams = body as RankedTeam[];
      expect(teams).to.have.length(TEAMS.length);
      expect(teams[0].teamName).to.equal(GROUP_WINNER.teamName);
      for (const team of teams) {
        expect(team.numberOfGamesPlayed, `games of ${team.teamName}`).to.be.greaterThan(0);
        expect(team.groupPoints, `group points of ${team.teamName}`)
          .to.equal(GROUP_POINTS[team.character.characterName] * team.numberOfGamesPlayed);
      }
    });

    asAdmin('/admin/teams');
    cy.contains('.teamContainer', GROUP_WINNER.teamName).find('[title="Team nicht am Finale teilnehmen lassen"]').click();
    cy.contains('.teamContainer', GROUP_WINNER.teamName).find('[title="Team am Finale teilnehmen lassen"]');

    asAdmin('/admin/final');
    for (const finalist of [FIRST, SECOND, THIRD, FOURTH]) {
      cy.contains(finalist.teamName);
    }
    cy.contains(GROUP_WINNER.teamName).should('not.exist');
    cy.contains('ion-button', 'Finale erzeugen').click();
    cy.location('pathname').should('eq', '/admin/dashboard');

    loginAsTeam(FIRST.teamName);
    currentGame().should('contain', `Switch ${SWITCHES[0].name}`).and('contain', FOURTH.teamName);
    rankingTab().should('exist');

    createQuestion(FINAL_QUESTION, 'TEAM', { finalTeamsOnly: true });
    FINAL_VOTES.forEach((finalist, index) => {
      onNewPhone(TEAM_NAMES[index]);
      answer(FINAL_QUESTION, pick(finalist)).should('eq', 200);
    });
    closeQuestion(FINAL_QUESTION);
    statisticsOf(FINAL_QUESTION).then(({ options, statistics }) => {
      expect(options).to.have.members([FIRST, SECOND, THIRD, FOURTH].map(team => team.teamName));
      expect(statistics).to.deep.equal(countVotes(options, FINAL_VOTES));
    });

    scoreRound('Finale 2', FINAL_POINTS);
    scoreRound('Finale 3', FINAL_POINTS);

    asAdmin('/admin/results');
    cy.contains('h2', 'Endergebnis');
    cy.adminApi('GET', '/admin/teams/sortedByFinalPoints').its('body').then(body => {
      const teams = body as RankedTeam[];
      expect(teams.slice(0, 4).map(team => team.teamName)).to.deep.equal(FINAL_ORDER);

      const groupPointsOf = (teamName: string) => teams.find(team => team.teamName === teamName)!.groupPoints;
      loginAsTeam(TEAM_NAMES[0]);
      rankingTab().click();
      cy.contains('.flexContainer > .teamContainer', GROUP_WINNER.teamName)
        .should('contain', '1. Platz')
        .and('contain', `${groupPointsOf(GROUP_WINNER.teamName)} Punkte`);
      cy.contains('.flexContainer > .teamContainer.userTeam', TEAM_NAMES[0])
        .should('contain', `${TEAMS.length}. Platz`)
        .and('contain', `${groupPointsOf(TEAM_NAMES[0])} Punkte`);
    });

    asAdmin('/admin/control');
    cy.contains('ion-button', 'Anwendung zurücksetzen').click();
    cy.get('ion-modal ion-button.round:not(.secondary)').click();
    cy.request(`${API_URL}/public/teams`).its('body').should('have.length', 0);
  });
});

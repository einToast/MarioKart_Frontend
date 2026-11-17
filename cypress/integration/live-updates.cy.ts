import { SWITCHES } from '../support/backend';
import {
  changeBreak, createSurvey, endBreak, loginAsTeam, markPlayed, section, setPoints, teamPlayingIn, waitForLiveUpdates,
} from '../support/app';

const PIZZA = "It's pizza time!";
const NO_SURVEYS = 'Gerade finden keine Umfragen statt.';

const rankingTab = () => cy.get('ion-tab-button[tab="tab2"]');

describe('live updates on the team phones', () => {
  beforeEach(() => {
    cy.resetBackend();
    cy.registerTeams();
  });

  it('announces a moved break, starts it and ends it without a reload', () => {
    cy.createSchedule().then(([first, second]) => {
      const team = teamPlayingIn(first, second);
      loginAsTeam(team);
      section('Aktuelles Spiel').should('contain', team);
      section('Nächstes Spiel').should('contain', team).and('not.contain', PIZZA);
      waitForLiveUpdates();

      changeBreak(second);
      section('Nächstes Spiel').should('contain', PIZZA);

      markPlayed(first);
      section('Aktuelles Spiel').should('contain', PIZZA);

      changeBreak(second, true);
      section('Aktuelles Spiel').should('contain', team).and('not.contain', PIZZA);
    });
  });

  it('hides the ranking for the last round and shows the final once the admin creates it', () => {
    cy.createSchedule().then(rounds => {
      const finalist = teamPlayingIn(rounds[0]);
      setPoints(rounds[0], finalist, 40);
      loginAsTeam(finalist);
      rankingTab().should('exist');
      waitForLiveUpdates();

      endBreak();
      markPlayed(...rounds.slice(0, -1));
      rankingTab().should('not.exist');

      markPlayed(rounds[rounds.length - 1]);
      cy.adminApi('POST', '/admin/schedule/create/final_schedule');

      rankingTab().should('exist');
      section('Aktuelles Spiel').should('contain', finalist).and('contain', `Switch ${SWITCHES[0].name}`);
    });
  });

  it('shows a new survey, its result and its removal without a reload', () => {
    loginAsTeam('Team Mario');
    cy.get('a[title="Umfragen"]').click();
    cy.contains('p', NO_SURVEYS);
    waitForLiveUpdates();

    createSurvey().then(question => {
      cy.contains('ion-item', 'Wer gewinnt?').click();
      cy.contains('ion-button', 'Luigi').click();
      cy.contains('ion-button', 'Antwort speichern').click();
      cy.contains('ion-button', 'Antwort speichern').should('not.exist');

      cy.adminApi('PUT', `/admin/survey/${question.id}`, { ...question, active: false });
      cy.contains('ion-accordion', 'Wer gewinnt?').should('contain', '100%');

      cy.adminApi('DELETE', `/admin/survey/${question.id}`);
      cy.contains('p', NO_SURVEYS);
      cy.contains('ion-accordion', 'Wer gewinnt?').should('not.exist');
    });
  });
});

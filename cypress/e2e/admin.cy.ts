import { teams } from '../support/commands';

describe('admin area', () => {
  beforeEach(() => {
    cy.stubBackend();
  });

  describe('without a session', () => {
    it('sends every admin page to the admin login', () => {
      cy.visit('/admin/dashboard');
      cy.location('pathname').should('eq', '/admin/login');

      cy.visit('/admin/teams');
      cy.location('pathname').should('eq', '/admin/login');
    });

    it('rejects wrong credentials', () => {
      cy.stubApi('POST', '/public/user/login', '', 401);
      cy.visit('/admin/login');

      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('falsch');
      cy.contains('ion-button', 'Admin Bereich betreten').click();

      cy.toast('Nutzername oder Passwort ist falsch');
      cy.location('pathname').should('eq', '/admin/login');
    });

    it('logs the admin in and opens the dashboard', () => {
      cy.stubApi('POST', '/public/user/login', { user: { username: 'admin', isAdmin: true, ID: 1 } }).as('login');
      cy.visit('/admin/login');

      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('secret');
      // From here on the session exists
      cy.loginAsAdmin();
      cy.contains('ion-button', 'Admin Bereich betreten').click();

      cy.wait('@login').its('request.body').should('deep.equal', { username: 'admin', password: 'secret' });
      cy.location('pathname').should('eq', '/admin/dashboard');
      cy.contains('h1', 'Dashboard');
    });
  });

  describe('with a session', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.stubApi('GET', '/admin/teams/sortedByFinalPoints', teams());
    });

    it('opens the dashboard for /admin and offers the actions of the current tournament phase', () => {
      cy.visit('/admin');

      cy.location('pathname').should('eq', '/admin/dashboard');
      cy.contains('ion-button', 'Punkte eintragen');
      cy.contains('ion-button', 'Spielplan erzeugen').should('not.exist');
      cy.contains('ion-button', 'Finalspiele erzeugen').should('not.exist');
    });

    it('navigates to the team administration and back', () => {
      cy.visit('/admin/dashboard');

      cy.contains('ion-button', 'Teams').click();
      cy.location('pathname').should('eq', '/admin/teams');
      cy.contains('h3', 'Anzahl der angemeldeten Teams: 4');
      cy.contains('.teamContainer', 'Team Toad');

      cy.contains('.back', 'Zurück').click();
      cy.location('pathname').should('eq', '/admin/dashboard');
    });

    it('renames a team through the edit dialog', () => {
      cy.stubApi('GET', '/public/teams/characters/available', [{ id: 9, characterName: 'Yoshi' }]);
      cy.stubApi('PUT', '/admin/teams/2', teams()[1]).as('update');
      cy.visit('/admin/teams');

      cy.contains('.teamContainer', 'Team Luigi').find('ion-icon[title="Team bearbeiten"]').click();
      cy.get('ion-modal input[placeholder="Name eingeben"]').should('have.value', 'Team Luigi').clear().type('Die Grünen');
      cy.get('ion-modal').contains('ion-button', 'Team ändern').click();

      cy.wait('@update').its('request.body').should('deep.equal', {
        teamName: 'Die Grünen',
        characterName: 'Luigi',
        finalReady: true,
        active: true,
      });
      cy.toast('Team wurde geändert');
    });

    it('asks for confirmation before deleting the schedule in the control centre', () => {
      cy.stubApi('DELETE', '/admin/schedule/create/schedule').as('deleteSchedule');
      cy.visit('/admin/control');

      cy.contains('ion-button', 'Gesamten Spielplan löschen').click();
      cy.get('ion-modal').should('contain', 'Willst du wirklich den Spielplan löschen?');
      cy.get('ion-modal').contains('ion-button', 'Abbrechen').click();
      cy.get('@deleteSchedule.all').should('have.length', 0);

      cy.contains('ion-button', 'Gesamten Spielplan löschen').click();
      cy.get('ion-modal').contains('ion-button', 'Spielplan löschen').click();

      cy.wait('@deleteSchedule');
      cy.toast('Der Spielplan wurde gelöscht');
    });

    it('logs the admin out', () => {
      cy.stubApi('POST', '/public/user/logout').as('logout');
      cy.visit('/admin/dashboard');
      cy.contains('ion-button', 'Punkte eintragen');

      // After the logout the backend no longer accepts the session
      cy.stubApi('GET', '/public/user/login/check', '', 401);
      cy.contains('ion-button', 'Logout').click();

      cy.wait('@logout');
      cy.location('pathname').should('eq', '/admin/login');
    });
  });
});

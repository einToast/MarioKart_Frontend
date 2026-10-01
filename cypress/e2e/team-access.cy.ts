import { team } from '../support/commands';

describe('team access', () => {
  beforeEach(() => {
    cy.stubBackend();
  });

  describe('login', () => {
    it('sends a new visitor to the login, logs the chosen team in and remembers it', () => {
      cy.visit('/');
      cy.location('pathname').should('eq', '/login');

      cy.get('select').select('Team Peach');
      cy.get('.selected-character img').should('have.attr', 'src', '/characters/Peach.png');
      cy.contains('ion-button', 'Zum Team Team Peach anmelden').click();

      cy.location('pathname').should('eq', '/tab1');
      cy.contains('h1', 'Spielplan');
      cy.get('.loggedInUserHead').should('contain', 'Team Peach');
      cy.get('ion-tab-bar ion-tab-button').should('have.length', 4);

      cy.reload();
      cy.location('pathname').should('eq', '/tab1');
      cy.get('.loggedInUserHead').should('contain', 'Team Peach');
    });

    it('asks for a team when none is selected', () => {
      cy.visit('/login');

      cy.contains('ion-button', 'anmelden').click();

      cy.toast('Ausgewähltes Team nicht in der Liste gefunden.');
      cy.location('pathname').should('eq', '/login');
    });

    it('logs the team out again through the header menu', () => {
      cy.loginAsTeam(1, 'Mario');
      cy.visit('/tab1');

      cy.get('.loggedInUserHead').click();
      cy.contains('li', 'Abmelden').click();

      cy.location('pathname').should('eq', '/login');
      cy.getCookie('user').should('not.exist');
    });

    it('keeps teams out while the tournament is closed', () => {
      cy.stubApi('GET', '/public/settings', { tournamentOpen: false, registrationOpen: false });

      cy.visit('/login');

      cy.location('pathname').should('eq', '/admin/login');
      cy.get('input[name="username"]');
    });
  });

  describe('registration', () => {
    beforeEach(() => {
      cy.stubApi('GET', '/public/teams/characters/available', [
        { id: 42, characterName: 'Yoshi' },
        { id: 43, characterName: 'Wario' },
      ]);
    });

    it('registers a new team and takes it to the schedule', () => {
      cy.stubApi('POST', '/public/teams', team(9, 'Yoshi', { teamName: 'Die Dinos' })).as('register');
      cy.visit('/register');

      cy.get('select').select('Yoshi');
      cy.get('input[placeholder="Teamname"]').type('Die Dinos');
      cy.contains('ion-button', 'Team registrieren').click();

      cy.wait('@register').its('request.body').should('deep.equal', {
        teamName: 'Die Dinos',
        characterName: 'Yoshi',
        finalReady: true,
        active: true,
      });
      cy.location('pathname').should('eq', '/tab1');
      cy.get('.loggedInUserHead').should('contain', 'Die Dinos');
    });

    it('explains why a registration was rejected and stays on the form', () => {
      cy.stubApi('POST', '/public/teams', '', 400);
      cy.visit('/register');

      cy.get('select').select('Yoshi');
      cy.get('input[placeholder="Teamname"]').type('Die Dinos{enter}');

      cy.toast('Charakter schon registriert');
      cy.location('pathname').should('eq', '/register');
    });

    it('sends visitors to the login once the registration is closed', () => {
      cy.stubApi('GET', '/public/settings', { tournamentOpen: true, registrationOpen: false });

      cy.visit('/register');

      cy.location('pathname').should('eq', '/login');
    });

    it('links from the registration to the login', () => {
      cy.visit('/register');

      cy.contains('a', 'registriertem Team beitreten').click();

      cy.location('pathname').should('eq', '/login');
    });
  });
});

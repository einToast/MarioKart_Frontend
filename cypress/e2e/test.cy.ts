describe('App root', () => {
  it('redirects visitors without a team to the login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })
})
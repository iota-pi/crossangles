/// <reference types="Cypress" />

context('Actions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })

  it('can add and remove courses', () => {
    // Add COMP1511
    cy.get('#course-selection-autocomplete').type('comp1511{enter}')
    cy.get('#course-display').should('contain.text', 'COMP1511')

    // Add COMP1521
    cy.get('#course-selection-autocomplete').type('comp15')
    cy.get('[data-cy=autocomplete-option]')
      .first().should('contain.text', 'COMP1521')
      .click()
    cy.get('#course-display')
      .should('contain.text', 'COMP1511')
      .should('contain.text', 'COMP1521')

    // Search for courses starting with "M", select MATH1231 (requires clicking 'see more')
    cy.get('#course-selection-autocomplete').type('m')
    cy.get('[data-cy=autocomplete-option]')
      .last().should('contain.text', 'See more results...')
      .click()
    cy.get('[data-cy=autocomplete-option]')
      .contains('MATH1231')
      .click()
    cy.get('#course-display').should('contain.text', 'MATH1231')

    // Can remove a course
    cy.get('#course-display')
      .find('[data-cy=remove-course]')
      .eq(1)
      .click()
    cy.get('#course-display')
      .should('not.contain.text', 'COMP1521')
      .should('contain.text', 'COMP1511')
      .should('contain.text', 'MATH1231')
  })

  it('can add a custom course', () => {
    cy.get('[data-cy=create-custom-event]')
      .click()
    cy.get('#custom-event-title')
      .should('exist')
      .should('have.text', 'Add Personal Event')
    // cy.get('')

  })
})

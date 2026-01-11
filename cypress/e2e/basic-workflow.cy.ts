describe('basic workflow', () => {
  it('add, remove courses, basic timetable ', () => {
    cy.visit('/')

    cy.dataCy('autocomplete-input').type('math')
    cy.contains('MATH1081').click()

    cy.dataCy('autocomplete-input').type('comp')
    cy.contains('COMP1511').click()

    cy.dataCy('colour-control').eq(0).click()
    cy.dataCy('colour-control')
      .get('[data-colour="blue"]')
      .last()
      .click()

    cy.dataCy('event-CBS~The Bible Talks').click()
    cy.dataCy('event-CBS~The Bible Talks').should('be.checked')
    cy.dataCy('event-CBS~Bible Study').should('not.be.checked')

    cy.dataCy('timetable-table').should('be.visible')
    cy.dataCy('timetable-table')
      .contains('COMP1511')
      .should('be.visible')

    cy.dataCy('timetable-table')
      .contains('MATH1081')
      .should('be.visible')
  })
})

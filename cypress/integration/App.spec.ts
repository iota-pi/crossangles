/// <reference types="Cypress" />

context('General app flow', () => {
  beforeEach(() => {
    cy.server()
    cy.route('/unsw/data.json', 'fixture:data-s2-2019.json')
    cy.visit('/')
  })

  it('displays selected courses in timetable', () => {
    // Add COMP1511 and MATH1231
    cy.get('#course-selection-autocomplete')
      .type('COMP1511')
    cy.dataCy('autocomplete-option')
      .first().click()
    cy.get('#course-selection-autocomplete')
      .type('MATH1231')
    cy.dataCy('autocomplete-option')
      .first().click()

    cy.dataCy('timetable-session')
      .should('contain.text', 'COMP1511 LEC')
      .should('contain.text', 'COMP1511 TLB')
      .should('contain.text', 'MATH1231 LEC')
      .should('contain.text', 'MATH1231 TUT')

    cy.dataCy('remove-course')
      .eq(1)
      .click()

    cy.dataCy('timetable-session')
      .should('contain.text', 'COMP1511')
      .should('not.contain.text', 'MATH1231')
  })

  it('can change course colours', () => {
    cy.get('#course-selection-autocomplete')
      .type('COMP1511')
    cy.dataCy('autocomplete-option')
      .first().click()

    cy.dataCy('colour-selector')
      .first()
      .click()
    cy.dataCy('colour-picker')
      .dataCy('colour-selector')
      .first()
      .click()

    cy.dataCy('colour-selector').then($colour => {
      const initialBG = $colour.css('backgroundColor')

      cy.dataCy('timetable-session-background')
        .should('have.css', 'background-color').and('eq', initialBG)

      cy.dataCy('colour-selector')
        .first()
        .click()
      cy.dataCy('colour-picker')
        .dataCy('colour-selector')
        .last()
        .click()
        .then($colour2 => {
          const finalBG = $colour.css('backgroundColor')

          cy.dataCy('timetable-session-background')
            .should('have.css', 'background-color').and('eq', finalBG)
        })
    })
  })

  it('can toggle web streams', () => {
    // Add COMP1511 and COMP1521
    cy.get('#course-selection-autocomplete')
      .type('COMP1511')
    cy.dataCy('autocomplete-option')
      .first().click()
    cy.get('#course-selection-autocomplete')
      .type('COMP2511')
    cy.dataCy('autocomplete-option')
      .first().click()

    cy.dataCy('web-stream-toggle')
      .first().click()
    cy.dataCy('timetable-session')
      .should('not.contain.text', 'COMP1511 LEC')
      .should('contain.text', 'COMP2511 LEC')
      .should('contain.text', 'COMP1511 TLB')
      .should('contain.text', 'COMP2511 TLB')

    cy.dataCy('web-stream-toggle')
      .first().click()
    cy.dataCy('timetable-session')
      .should('contain.text', 'COMP1511 LEC')
      .should('contain.text', 'COMP2511 LEC')
      .should('contain.text', 'COMP1511 TLB')
      .should('contain.text', 'COMP2511 TLB')

    cy.dataCy('web-stream-toggle')
      .last().click()
    cy.dataCy('timetable-session')
      .should('contain.text', 'COMP1511 LEC')
      .should('not.contain.text', 'COMP2511 LEC')
      .should('contain.text', 'COMP1511 TLB')
      .should('contain.text', 'COMP2511 TLB')

    cy.dataCy('web-stream-toggle')
      .first().click()
    cy.dataCy('timetable-session')
      .should('not.contain.text', 'COMP1511 LEC')
      .should('not.contain.text', 'COMP2511 LEC')
      .should('contain.text', 'COMP1511 TLB')
      .should('contain.text', 'COMP2511 TLB')
  })

  it('can add and remove additional events', () => {
    cy.dataCy('event-The Bible Talks')
      .click()
    cy.dataCy('timetable-session')
      .should('contain.text', 'The Bible Talks')
    cy.dataCy('event-Bible Study')
      .click()
    cy.dataCy('event-Core Theology')
      .click()
    cy.dataCy('event-Core Training')
      .click()

    cy.dataCy('timetable-session')
      .should('contain.text', 'The Bible Talks')
      .should('contain.text', 'Bible Study')
      .should('contain.text', 'Core Theology')
      .should('contain.text', 'Core Training')

    cy.dataCy('event-The Bible Talks')
      .click()
    cy.dataCy('event-Core Theology')
      .click()
    cy.dataCy('timetable-session')
      .should('not.contain.text', 'The Bible Talks')
      .should('not.contain.text', 'Core Theology')
      .should('contain.text', 'Bible Study')
      .should('contain.text', 'Core Training')
  })
})

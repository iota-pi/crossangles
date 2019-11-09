/// <reference types="Cypress" />

context('Custom event', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
    cy.dataCy('create-custom-event')
      .click()
  })

  it('can open and close custom event dialog', () => {
    cy.get('#custom-event-title')
      .should('exist')
    cy.dataCy('custom-event-name')
      .find('input')
      .should('be.focused')
    cy.dataCy('close-dialog')
      .click()
    cy.get('#custom-event-title')
      .should('not.exist')
  })

  it('limits name length to 40 characters', () => {
    const testString = 'the quick brown fox jumped over the lazy dog'
    cy.dataCy('custom-event-name')
      .type(testString)
      .find('input')
      .should('have.value', testString.substr(0, 40))
  })

  it('gives error when event runs too late', () => {
    cy.dataCy('custom-event-duration')
      .click()
    cy.dataCy('custom-event-duration-item')
      .eq(15)
      .click()

    cy.dataCy('custom-event-time')
      .click()
    cy.dataCy('custom-event-time-item')
      .contains('4:30 PM')
      .click()

    cy.dataCy('custom-event-duration')
      .find('.MuiInput-root')
      .should('have.class', 'Mui-error')
    cy.dataCy('custom-event-time')
      .find('.MuiInput-root')
      .should('have.class', 'Mui-error')

    cy.dataCy('custom-event-time')
      .click()
    cy.dataCy('custom-event-time-item')
      .contains('4:00 PM')
      .click()

    cy.dataCy('custom-event-duration')
      .find('.MuiInput-root')
      .should('not.have.class', 'Mui-error')
    cy.dataCy('custom-event-time')
      .find('.MuiInput-root')
      .should('not.have.class', 'Mui-error')
  })

  it('adds and removes options as intended', () => {
    cy.dataCy('custom-event-day')
      .should('have.length', 1)
      .last()
      .click()
    cy.dataCy('custom-event-day-item')
      .first()
      .click()

    cy.dataCy('custom-event-time')
      .should('have.length', 1)
      .last()
      .click()
    cy.dataCy('custom-event-time-item')
      .first()
      .click()

    cy.dataCy('custom-event-day')
      .should('have.length', 2)
      .last()
      .click()
    cy.dataCy('custom-event-day-item')
      .last()
      .click()

    cy.dataCy('custom-event-time')
      .should('have.length', 2)
      .last()
      .click()
    cy.dataCy('custom-event-time-item')
      .last()
      .click()

    cy.dataCy('custom-event-day')
      .should('have.length', 3)
      .eq(0)
      .find('[data-cy=clear-input]')
      .click()
    cy.dataCy('custom-event-time')
      .should('have.length', 3)
      .eq(1)
      .find('[data-cy=clear-input]')
      .click()
    cy.dataCy('custom-event-time')
      .should('have.length', 3)
      .eq(0)
      .find('[data-cy=clear-input]')
      .click()

    cy.dataCy('custom-event-day')
      .should('have.length', 2)
      .first()
      .find('input')
      .should('contain.value', 'F')
  })

  it('validates data', () => {
    const checkSubmitDisabled = () => {
      cy.dataCy('custom-event-submit')
        .should('be.disabled')
        .should('have.class', 'Mui-disabled')
    }
    const checkSubmitEnabled = () => {
      cy.dataCy('custom-event-submit')
        .should('not.be.disabled')
        .should('not.have.class', 'Mui-disabled')
    }

    checkSubmitDisabled();

    cy.dataCy('custom-event-name')
      .type('a')
    checkSubmitDisabled();

    cy.dataCy('custom-event-day')
      .last()
      .click()
    cy.dataCy('custom-event-day-item')
      .first()
      .click()
    checkSubmitDisabled();

    cy.dataCy('custom-event-time')
      .last()
      .click()
    cy.dataCy('custom-event-time-item')
      .first()
      .click()
    checkSubmitEnabled();

    cy.dataCy('custom-event-name')
      .find('input')
      .clear()
    checkSubmitDisabled();

    cy.dataCy('custom-event-name')
      .type('a')

    cy.dataCy('custom-event-day')
      .last()
      .click()
    cy.dataCy('custom-event-day-item')
      .first()
      .click()
    checkSubmitDisabled();

    cy.dataCy('custom-event-time')
      .last()
      .click()
    cy.dataCy('custom-event-time-item')
      .last()
      .click()
    checkSubmitEnabled();

    cy.dataCy('custom-event-day')
      .first()
      .find('[data-cy=clear-input]')
      .click()
    checkSubmitDisabled();

    cy.dataCy('custom-event-time')
      .first()
      .find('[data-cy=clear-input]')
      .click()
    checkSubmitEnabled();

    cy.dataCy('custom-event-duration')
      .click()
    cy.dataCy('custom-event-duration-item')
      .last()
      .click()
    checkSubmitDisabled();
  })
})

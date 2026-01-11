// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//

Cypress.Commands.add('dataCy', (...dataCy: string[]) => (
  cy.get(dataCy.map(id => `[data-cy="${id}"]`).join(','))
))

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(...dataCy: string[]): Chainable<JQuery<HTMLElement>>
    }
  }
}

export {}

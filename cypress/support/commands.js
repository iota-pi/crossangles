// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --

import { dragAndDrop, dragStart, dragMove, dragStop } from './draganddrop'

Cypress.Commands.add('dataCy', { prevSubject: 'optional' }, (subject, value) => {
  if (subject) {
    return cy.wrap(subject).find(`[data-cy=${value}]`)
  } else {
    return cy.get(`[data-cy=${value}]`)
  }
})

// This is a workaround for https://github.com/cypress-io/cypress/issues/5655
Cypress.Commands.add('expectData', { prevSubject: 'element' }, (subject, key, value) => {
  return cy.wrap(subject).filter(`[data-${key}=${value}]`).should('exist')
})

Cypress.Commands.add('dragAndDrop', { prevSubject: 'optional' }, dragAndDrop);
Cypress.Commands.add('dragStart', { prevSubject: 'optional' }, dragStart);
Cypress.Commands.add('dragMove', { prevSubject: 'optional' }, dragMove);
Cypress.Commands.add('dragStop', { prevSubject: 'optional' }, dragStop);

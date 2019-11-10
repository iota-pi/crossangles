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

import dragAndDrop from './draganddrop'

Cypress.Commands.add('dataCy', { prevSubject: 'optional' }, (subject, value) => {
  if (subject) {
    return cy.wrap(subject).find(`[data-cy=${value}]`)
  } else {
    return cy.get(`[data-cy=${value}]`)
  }
})

Cypress.Commands.add('dragAndDrop', { prevSubject: 'optional' }, dragAndDrop);

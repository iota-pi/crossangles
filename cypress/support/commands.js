import { dragAndDrop, dragStart, dragMove, dragStop, dragTo } from './draganddrop';

Cypress.Commands.add('dataCy', { prevSubject: 'optional' }, (subject, value) => {
  if (subject) {
    return cy.wrap(subject).find(`[data-cy="${value}"]`);
  } else {
    return cy.get(`[data-cy="${value}"]`);
  }
})

// This is a workaround for https://github.com/cypress-io/cypress/issues/5655
Cypress.Commands.add('expectData', { prevSubject: 'element' }, (subject, key, value) => {
  return cy.wrap(subject).filter(`[data-${key}=${value}]`).should('exist');
})

Cypress.Commands.add('dragTo', { prevSubject: 'element' }, dragTo);
Cypress.Commands.add('dragAndDrop', { prevSubject: 'optional' }, dragAndDrop);
Cypress.Commands.add('dragStart', { prevSubject: 'optional' }, dragStart);
Cypress.Commands.add('dragMove', { prevSubject: 'optional' }, dragMove);
Cypress.Commands.add('dragStop', { prevSubject: 'optional' }, dragStop);

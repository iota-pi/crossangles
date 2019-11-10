/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
    */
    dataCy(value: string): Chainable<JQuery>,

    /**
     * Custom command to drag and drop an element by given offset.
     * @example cy.get('[data-cy=draggable]').dragAndDrop()
    */
    dragAndDrop(offset: { x: number, y: number }): Chainable<JQuery>,
  }
}

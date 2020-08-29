/// <reference types="cypress" />


declare namespace Cypress {
  type positionString = 'topLeft'|'top'|'topRight'|'left'|'center'|'right'|'bottomLeft'|'bottom'|'bottomRight';

  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
    */
    dataCy(value: string): Chainable<JQuery>,

    /**
     * Custom command to drag and drop an element to another one
     * @example cy.get('[data-cy=draggable]').dragTo('T10')
    */
    dragTo(time: string): Chainable<JQuery>,

    /**
      * Custom command to drag and drop an element by given offset.
      * @example cy.get('[data-cy=draggable]').dragAndDrop({ x: 100, y: 100 })
    */
    dragAndDrop(offset: { x: number, y: number, absolute?: boolean }): Chainable<JQuery>,

    /**
     * Custom command to start draging an element
     * @example cy.get('[data-cy=draggable]').dragStart()
    */
    dragStart(): Chainable<JQuery>,

    /**
     * Custom command to drag the element which is currently being dragged (via `dragStart()`)
     * by given offset, or to an absolute position
     * @example cy.get('[data-cy=draggable]').dragMove({ x: 100, y: 100 })
    */
    dragMove(offset?: { x: number, y: number, absolute?: boolean }): Chainable<JQuery>,

    /**
     * Custom command to drop the element which is currently being dragged
     * @example cy.get('[data-cy=draggable]').dragStop()
    */
    dragStop(): Chainable<JQuery>,

    /**
      * Custom command to drop the element which is currently being dragged
      * @example cy.get('[data-cy=draggable]').dragStop()
    */
    expectData(key: string, value: string | number): Chainable<JQuery>,
  }
}

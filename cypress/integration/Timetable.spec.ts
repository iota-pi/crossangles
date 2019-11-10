/// <reference types="Cypress" />
import { SESSION_BASE_Z, SESSION_LIFT_Z, SESSION_DRAG_Z } from '../../src/components/Timetable/timetableUtil';

const TEST_CODE = 'TEST1010'

context('Timetable interaction', () => {
  beforeEach(() => {
    cy.server()
    cy.route('/data.json', 'fixture:data.json')
    cy.visit('/')

    // Add test course
    cy.get('#course-selection-autocomplete')
      .click()
    cy.dataCy('autocomplete-option')
      .click()
  })

  it('can do basic dragging and snapping', () => {
    cy.get(`[data-session=${TEST_CODE}-F9-10]`).as('session')

    cy.get('@session')
      .should('have.css', 'z-index')
      .and('eq', '' + SESSION_BASE_Z)
    cy.get('@session')
      .trigger('mousedown', { force: true })
      .should('have.css', 'z-index')
      .and('eq', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    cy.dataCy('timetable-dropzone-F9')
      .should('exist')
    cy.get('@session')
      .trigger('mouseup', { force: true })
      .should('have.css', 'z-index')
      .and('eq', '' + SESSION_BASE_Z)
    cy.dataCy('timetable-dropzone-F9')
      .should('not.exist')

    cy.get('@session')
      .dragAndDrop({ x: -100, y: 100 })

    // cy.get('@session')
    //   .then($el => {
    //     const offset = $el.offset()!
    //     expect(Math.floor(offset.top)).equal(Math.floor(initialOffset.top))
    //     expect(Math.floor(offset.left)).equal(Math.floor(initialOffset.left))
    //   })

    // cy.get('@session')
    //   .trigger('mousedown')
    //   .should('have.css', 'z-index')
    //   .and('eq', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    // cy.get('@session')
    //   .trigger('mousemove', { clientX: 500, clientY: 500 })
    // cy.get('@session')
    //   .trigger('mouseup')
    //   .should('have.css', 'z-index')
    //   .and('eq', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))

    // cy.get('@session')
    //   .trigger('mousedown')
    //   .should('have.css', 'z-index')
    //   .and('eq', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    // cy.get('@session')
    //   .trigger('mousemove', { clientX: initialOffset.left, clientY: initialOffset.top })
    // cy.get('@session')
    //   .trigger('mouseup')
    //   .should('have.css', 'z-index')
    //   .and('eq', '' + SESSION_BASE_Z)
  })

  // it('can drag linked sessions around', () => {
  //   cy.dataCy('timetable-session')
  //     .first()
  //     .trigger('mousedown')
  //     .trigger('mouseup')
  //   cy.dataCy('timetable-session')
  //     .should('have.css', 'z-index')
  //     .and('eq', '' + SESSION_BASE_Z)

  //   // let offset;
  //   cy.dataCy('timetable-session')
  //     .first()
  //     // .then($el => {
  //     //   offset = $el.offset();
  //     // })
  //     .trigger('mousedown')
  //   cy.dataCy('timetable-session')
  //     .first()
  //     .trigger('mousemove')
  //   cy.dataCy('timetable-session')
  //     .first()
  //     .trigger('mouseup')
  // })
})

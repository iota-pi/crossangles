/// <reference types="Cypress" />
import { SESSION_BASE_Z, SESSION_DRAG_Z, SESSION_LIFT_Z } from '../../src/components/Timetable/timetableUtil';

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
    const session = `[data-session=${TEST_CODE}-F9-10]`

    cy.get(session)
      .expectData('snapped', 1)
      .should('have.css', 'z-index', '' + SESSION_BASE_Z)
    cy.get(session)
      .trigger('mousedown', { force: true })
    cy.get(`[data-session=${TEST_CODE}-F9-10]`)
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    cy.dataCy('timetable-dropzone-F9')
      .should('exist')
    cy.get(session)
      .trigger('mouseup', { force: true })
    cy.get(`[data-session=${TEST_CODE}-F9-10]`)
      .expectData('snapped', 1)
      .should('have.css', 'z-index', '' + SESSION_BASE_Z)
    cy.dataCy('timetable-dropzone-F9')
      .should('not.exist')

    cy.get(session)
      .dragAndDrop({ x: -100, y: 100 })
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))

    cy.get(session)
      .dragAndDrop({ x: 50, y: -50 })
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))

    cy.get(session)
      .dragAndDrop({ x: 30, y: -30 })
      .expectData('snapped', 1)
      .should('have.css', 'z-index', '' + SESSION_BASE_Z)
  })

  it('prevents dragging outside of the timetable', () => {
    cy.get(`[data-session=${TEST_CODE}-F9-10]`).as('session')

    cy.get('@session')
      .dragAndDrop({ x: 0, y: 0, absolute: true })
      .then($el => {
        const offset = $el[0].getBoundingClientRect()
        const parent = $el[0].offsetParent!.getBoundingClientRect()
        expect(offset.left).to.be.approximately(parent.left + 1, 0.1)
        expect(offset.top).to.be.approximately(parent.top + 1, 0.1)
      })
    cy.get('@session')
      .dragAndDrop({ x: 2000, y: 2000, absolute: true })
      .then($el => {
        const offset = $el[0].getBoundingClientRect()
        const parent = $el[0].offsetParent!.getBoundingClientRect()
        expect(offset.left + offset.width).to.be.approximately(parent.left + parent.width - 1, 0.1)
        expect(offset.top + offset.height).to.be.approximately(parent.top + parent.height - 1, 0.1)
      })
  })

  it('raises and lowers linked sessions', () => {
    cy.get(`[data-session=${TEST_CODE}-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-T10-12]`).as('linked')

    cy.get('@session')
      .dragStart()
    cy.get('@linked')
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    cy.get('@session')
      .dragMove({ x: 100, y: 100 })
      .dragStop()
    cy.get('@linked')
      .expectData('snapped', 1)
      .should('have.css', 'z-index', '' + SESSION_BASE_Z)
      .dragAndDrop({ x: 100, y: 100 })
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))

    cy.get('@session')
      .dragStart()
      .dragMove({ x: -75, y: -75 })
    cy.get('@linked')
      .expectData('snapped', 0)
    cy.get('@session')
      .dragStop()
    cy.get('@linked')
      .expectData('snapped', 1)
  })

  it('moves linked sessions', () => {
    cy.get(`[data-session=${TEST_CODE}-T10-12]`)
      .dragAndDrop({ x: 0, y: -50 })
    cy.get(`[data-session=${TEST_CODE}-M9-10]`)
      .should('exist')
      .expectData('snapped', 1)
    cy.get(`[data-session=${TEST_CODE}-T9-11]`)
      .should('exist')
      .expectData('snapped', 1)
  })

  it('allows full classes', () => {
    cy.get(`[data-session=${TEST_CODE}-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-T10-12]`).as('linked')

    cy.get('@session')
      .dragStart()
      .dragMove({ x: 0, y: 50 })
      .dragStop()
      .expectData('snapped', 0)
    cy.get('@linked')
      .expectData('snapped', 1)

    cy.get('input[value=includeFull]')
      .check()

    cy.get('@session')
      .expectData('snapped', 0)
      .dragStart()
      .dragStop()
      .expectData('snapped', 1)
    cy.get(`[data-session=${TEST_CODE}-T11-13]`)
      .should('exist')
      .expectData('snapped', 1)
  })

  it('displaces full classes', () => {
    cy.get(`[data-session=${TEST_CODE}-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-T10-12]`).as('linked')

    cy.get('input[value=includeFull]')
      .check()
    cy.get('@session')
      .dragTo('M11')
    cy.get('input[value=includeFull]')
      .uncheck()

    cy.get(`[data-session=${TEST_CODE}-M10-11]`)
      .should('exist')
    cy.get(`[data-session=${TEST_CODE}-M11-12]`)
      .should('not.exist')
    cy.get(`[data-session=${TEST_CODE}-T10-12]`)
      .should('exist')
    cy.get(`[data-session=${TEST_CODE}-T11-13]`)
      .should('not.exist')
  })
})

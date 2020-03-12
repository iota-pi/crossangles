/// <reference types="Cypress" />
import { SESSION_BASE_Z, SESSION_DRAG_Z, TIMETABLE_CELL_HEIGHT } from '../../src/components/Timetable/timetableUtil';

const TEST_CODE = 'TEST1010'

context('Timetable interaction', () => {
  beforeEach(() => {
    cy.server()
    cy.route('/unsw/data.json', 'fixture:data.json')
    cy.clearLocalStorage() // TODO: this shouldn't be necessary?!?!
    cy.visit('/')

    // Add test course
    cy.get('#course-selection-autocomplete')
      .click()
    cy.dataCy('autocomplete-option')
      .first()
      .click()
  })

  it('can do basic dragging and snapping', () => {
    const session = `[data-session=${TEST_CODE}-TUT-F9-10]`

    cy.get(session)
      .expectData('snapped', 1)
      .should('have.css', 'z-index', '' + SESSION_BASE_Z)
    cy.get(session)
      .trigger('mousedown', { force: true })
    cy.get(`[data-session=${TEST_CODE}-TUT-F9-10]`)
      .expectData('snapped', 0)
      .should('have.css', 'z-index', '' + (SESSION_BASE_Z + SESSION_DRAG_Z))
    cy.dataCy('timetable-dropzone-F9')
      .should('exist')
    cy.get(session)
      .trigger('mouseup', { force: true })
    cy.get(`[data-session=${TEST_CODE}-TUT-F9-10]`)
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
    cy.get(`[data-session=${TEST_CODE}-TUT-F9-10]`).as('session')

    cy.get('@session')
      .dragAndDrop({ x: 0, y: 0, absolute: true })
      .then($el => {
        const offset = $el[0].getBoundingClientRect()
        const parent = $el[0].offsetParent!.getBoundingClientRect()
        expect(offset.left).to.be.approximately(parent.left + 1, 0.1)
        expect(offset.top).to.be.approximately(parent.top + 1, 0.1)

        cy.get('@session')
          .dragAndDrop({ x: 2000, y: 2000, absolute: true })
          .then($el => {
            const offset = $el[0].getBoundingClientRect()
            const parent = $el[0].offsetParent!.getBoundingClientRect()
            expect(offset.left + offset.width).to.be.approximately(parent.left + parent.width - 1, 0.1)
            expect(offset.top + offset.height).to.be.approximately(parent.top + parent.height - 1, 0.1)
          })
      })
  })

  it.skip('raises and lowers linked sessions', () => {
    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-LEC-T10-12]`).as('linked')

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

  it.skip('moves linked sessions', () => {
    cy.get(`[data-session=${TEST_CODE}-LEC-T10-12]`)
      .dragAndDrop({ x: 0, y: -50 })
    cy.get(`[data-session=${TEST_CODE}-LEC-M9-10]`)
      .should('exist')
      .expectData('snapped', 1)
    cy.get(`[data-session=${TEST_CODE}-LEC-T9-11]`)
      .should('exist')
      .expectData('snapped', 1)
  })

  it('allows full classes', () => {
    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-LEC-T10-12]`).as('linked')

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
      .expectData('snapped', 1)
    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`)
      .should('not.exist')
    cy.get(`[data-session=${TEST_CODE}-LEC-M11-12]`)
      .should('exist')
    cy.get(`[data-session=${TEST_CODE}-LEC-T11-13]`)
      .should('exist')
      .expectData('snapped', 1)
  })

  it('displaces full classes', () => {
    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`).as('session')
    cy.get(`[data-session=${TEST_CODE}-LEC-T10-12]`).as('linked')

    cy.get('input[value=includeFull]')
      .check()
    cy.get('@session')
      .dragTo('M11')
    cy.get('input[value=includeFull]')
      .uncheck()

    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`)
      .should('exist')
    cy.get(`[data-session=${TEST_CODE}-LEC-M11-12]`)
      .should('not.exist')
    cy.get(`[data-session=${TEST_CODE}-LEC-T10-12]`)
      .should('exist')
    cy.get(`[data-session=${TEST_CODE}-LEC-T11-13]`)
      .should('not.exist')
  })

  it('allows and handles clashes properly', () => {
    cy.get(`[data-session=${TEST_CODE}-TUT-F9-10]` ).as('session1')
    cy.get(`[data-session=${TEST_CODE}-LEC-M10-11]`).as('session2')

    // Move session to clash
    cy.get('@session1')
      .dragTo('M9')
      .should('have.css', 'box-shadow').and('not.be', 'none')
    cy.get('@session1')
      .should('have.css', 'height', `${TIMETABLE_CELL_HEIGHT * 3 - 1}px`)
    cy.get('@session2')
      .should('have.css', 'box-shadow', 'none')

    // Move other clashing session on top
    cy.get('@session2')
      .dragStart()
      .dragStop()
      .should('have.css', 'box-shadow').and('not.be', 'none')

    // Move first session back to a non-clashing position
    cy.get('@session1')
      .should('have.css', 'box-shadow', 'none')
    cy.get('@session1')
      .dragTo('F10')
      .should('have.css', 'box-shadow', 'none')
    cy.get('@session1')
      .should('have.css', 'height', `${TIMETABLE_CELL_HEIGHT - 1}px`)
    cy.get('@session2')
      .should('have.css', 'box-shadow', 'none')
  })
})

context('Timetable controls', () => {
  beforeEach(() => {
    cy.server()
    cy.route('/unsw/data.json', 'fixture:data-with-cbs.json')
    cy.visit('/')

    // Add test course
    cy.get('#course-selection-autocomplete')
      .click()
    cy.dataCy('autocomplete-option')
      .click()
  })

  it('can use undo/redo buttons', () => {
    // Add custom course
    cy.dataCy('create-custom-event')
      .click()
    cy.dataCy('custom-event-name')
      .type('Playing spikeball')
    cy.dataCy('custom-event-duration')
      .click()
    cy.dataCy('custom-event-duration-item')
      .eq(4)
      .click()
    cy.dataCy('custom-event-day')
      .last()
      .click()
    cy.dataCy('custom-event-day-item')
      .first()
      .click()
    cy.dataCy('custom-event-time')
      .last()
      .click()
    cy.dataCy('custom-event-time-item')
      .first()
      .click()
    cy.dataCy('custom-event-submit')
      .click()

    // Add the Bible talks
    cy.dataCy('event-The Bible Talks')
      .click()

    // Should not be able to redo
    cy.dataCy('redo-button')
      .should('be.disabled')

    // Undo adding the Bible talks
    cy.dataCy('timetable-session')
      .should('contain.text', 'The Bible Talks')
    cy.dataCy('event-The Bible Talks')
      .find('input[type=checkbox]')
      .should('be.checked')
    cy.dataCy('undo-button')
      .click()
    cy.dataCy('timetable-session')
      .should('not.contain.text', 'The Bible Talks')
    cy.dataCy('event-The Bible Talks')
      .find('input[type=checkbox]')
      .should('not.be.checked')

    // Redo it
    cy.dataCy('redo-button')
      .should('not.be.disabled')
    cy.dataCy('redo-button')
      .click()
    cy.dataCy('timetable-session')
      .should('contain.text', 'The Bible Talks')
    cy.dataCy('event-The Bible Talks')
      .find('input[type=checkbox]')
      .should('be.checked')

    // Should not be able to redo
    cy.dataCy('redo-button')
      .should('be.disabled')

    // Edit custom course
    cy.dataCy('edit-custom')
      .click()
    cy.dataCy('custom-event-name')
      .find('input')
      .should('have.value', 'Playing spikeball')
      .clear()
      .type('Walkup')
    cy.dataCy('custom-event-duration')
      .first()
      .click()
    cy.dataCy('custom-event-duration-item')
      .eq(3)
      .click()
    cy.dataCy('custom-event-day')
      .first()
      .click()
    cy.dataCy('custom-event-day-item')
      .eq(1)
      .click()
    cy.dataCy('custom-event-submit')
      .click()

    // Undo twice
    cy.get('[data-session^="custom_"][data-session$="T8-10"]')
      .should('exist')
    cy.dataCy('undo-button')
      .click()
    cy.get('[data-session^="custom_"][data-session$="T8-10"]')
      .should('not.exist')
    cy.get('[data-session^="custom_"][data-session$="M8-10.5"]')
      .should('exist')
    cy.dataCy('undo-button')
      .click()
    cy.dataCy('timetable-session')
      .should('not.contain.text', 'The Bible Talks')
    cy.dataCy('event-The Bible Talks')
      .find('input[type=checkbox]')
      .should('not.be.checked')

    // Redo twice
    cy.dataCy('redo-button')
      .click()
    cy.get('[data-session^="custom_"][data-session$="T8-10"]')
      .should('not.exist')
    cy.dataCy('redo-button')
      .click()
    cy.get('[data-session^="custom_"][data-session$="T8-10"]')
      .should('exist')

    // Refresh page
    cy.reload()

    // Cannot undo or redo
    cy.dataCy('undo-button').should('be.disabled')
    cy.dataCy('redo-button').should('be.disabled')

    // Sessions exist
    cy.get('[data-session^="custom_"][data-session$="T8-10"]')
      .should('exist')
    cy.dataCy('timetable-session')
      .should('contain.text', 'The Bible Talks')
    cy.dataCy('event-The Bible Talks')
      .find('input[type=checkbox]')
      .should('be.checked')
    cy.get(`[data-session^="${TEST_CODE}"]`)
      .should('have.length', 3)
  })

  it('can undo after dragging', () => {
    // Add TBT
    cy.dataCy('event-The Bible Talks')
      .click()

    // Move the Bible talk
    cy.get('[data-session="CBS-The Bible Talks-T12-13"]').as('session')
      .should('exist')
    cy.get('@session')
      .dragTo('W12')
      .dragTo('H12')

    // Should not be able to redo
    cy.dataCy('redo-button').should('be.disabled')

    // Undo and check position
    cy.dataCy('undo-button').click()
    cy.get('[data-session="CBS-The Bible Talks-H12-13"]')
      .should('not.exist')
    cy.get('[data-session="CBS-The Bible Talks-W12-13"]')
      .should('exist')

    // Should be able to redo
    cy.dataCy('redo-button').should('not.be.disabled')

    // Move session again
    cy.get('@session')
      .dragTo('T13')

    // Should not be able to redo
    cy.dataCy('redo-button').should('be.disabled')

    // Undo and check position
    cy.dataCy('undo-button').click()
    cy.get('[data-session="CBS-The Bible Talks-T13-14"]')
      .should('not.exist')
    cy.get('[data-session="CBS-The Bible Talks-W12-13"]')
      .should('exist')
    cy.dataCy('undo-button').click()
    cy.get('[data-session="CBS-The Bible Talks-W12-13"]')
      .should('not.exist')
    cy.get('[data-session="CBS-The Bible Talks-T12-13"]')
      .should('exist')

    cy.dataCy('undo-button').click()
    cy.get('[data-session^="CBS-The Bible Talks-"]')
      .should('not.exist')
  })
})

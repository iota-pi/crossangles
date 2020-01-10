export const CLICK_MARGIN = 5;
export const PRIMARY_BUTTON = 0;

export const dragAndDrop = (subject, offset = { x: 0, y: 0, absolute: false }) => {
  cy.wrap(subject)
    .dragStart()
    .dragMove(offset)
    .dragStop()
};

export const dragTo = (subject, time) => {
  cy.wrap(subject)
    .trigger('mousemove', { force: true })
    .wait(500)
    .trigger('mousedown', { force: true })
  cy.get(`[data-time=${time}]`)
    .trigger('mousemove', { force: true })
  cy.wrap(subject)
    .trigger('mouseup')
}

export const dragStart = (subject) => {
  const coords = subject[0].getBoundingClientRect();
  coords.x += CLICK_MARGIN;
  coords.y += CLICK_MARGIN;

  cy.wrap(subject)
    .trigger('mousedown', {
      button: PRIMARY_BUTTON,
      clientX: coords.x,
      clientY: coords.y,
      force: true,
      which: 1,
    })
    .trigger('mousemove', {
      button: PRIMARY_BUTTON,
      clientX: coords.x,
      clientY: coords.y,
      force: true,
      which: 1,
    })
}

export const dragMove = (subject, offset = { x: 0, y: 0, absolute: false }) => {
  const coords = subject[0].getBoundingClientRect();
  coords.x += CLICK_MARGIN;
  coords.y += CLICK_MARGIN;

  cy.get('body')
    .trigger('mousemove', {
      button: PRIMARY_BUTTON,
      clientX: (!offset.absolute ? coords.x : CLICK_MARGIN) + offset.x,
      clientY: (!offset.absolute ? coords.y : CLICK_MARGIN) + offset.y,
      force: true,
      which: 1,
    })

  return cy.wrap(subject)
}

export const dragStop = (subject) => {
  cy.get('body').trigger('mouseup', {
      button: PRIMARY_BUTTON,
      force: true,
      which: 1,
    });

  return cy.wrap(subject);
}

export default dragAndDrop;

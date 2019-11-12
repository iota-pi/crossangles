export const CLICK_MARGIN = 5;
export const PRIMARY_BUTTON = 0;

export const dragAndDrop = (subject, offset = { x: 0, y: 0, absolute: false }) => {
  cy.wrap(subject)
    .dragStart()
    .dragMove(offset)
    .dragStop()
};

export const dragStart = (subject) => {
  cy.wrap(subject)
    .first()
    .then(element => {
      const coords = element[0].getBoundingClientRect();
      coords.x += CLICK_MARGIN;
      coords.y += CLICK_MARGIN;

      cy.wrap(element)
        .trigger('mousemove', {
          button: PRIMARY_BUTTON,
          clientX: coords.x,
          clientY: coords.y,
          force: true,
        })
      cy.wrap(element)
        .trigger('mousedown', {
          button: PRIMARY_BUTTON,
          clientX: coords.x,
          clientY: coords.y,
          force: true,
        });
    })

    return cy.wrap(subject)
}

export const dragMove = (subject, offset = { x: 0, y: 0, absolute: false }) => {
  cy.wrap(subject)
    .first()
    .then(element => {
      const coords = element[0].getBoundingClientRect();
      coords.x += CLICK_MARGIN;
      coords.y += CLICK_MARGIN;

      cy.get('body')
        .trigger('mousemove', {
          button: PRIMARY_BUTTON,
          clientX: (!offset.absolute ? coords.x : CLICK_MARGIN) + offset.x,
          clientY: (!offset.absolute ? coords.y : CLICK_MARGIN) + offset.y,
          force: true,
        })
    })

    return cy.wrap(subject)
}

export const dragStop = (subject) => {
  cy.get('body').trigger('mouseup');

  return cy.wrap(subject);
}

export default dragAndDrop;

export const CLICK_MARGIN = 5;
export const PRIMARY_BUTTON = 0;

export default (subject, offset = { x: 0, y: 0 }) => {
  cy.clock(+new Date());

  cy.wrap(subject)
    .first()
    .then(element => {
      const coords = element[0].getBoundingClientRect();
      coords.x += CLICK_MARGIN;
      coords.y += CLICK_MARGIN;

      cy.wrap(element)
        .trigger("mousemove", {
          button: PRIMARY_BUTTON,
          clientX: coords.x,
          clientY: coords.y,
          force: true,
        })
        .tick(200)
      cy.wrap(element)
        .trigger("mousedown", {
          button: PRIMARY_BUTTON,
          clientX: coords.x,
          clientY: coords.y,
          force: true,
        });

      cy.get("body")
        .trigger("mousemove", {
          button: PRIMARY_BUTTON,
          clientX: coords.x + offset.x,
          clientY: coords.y + offset.y,
          force: true,
        })
        .tick(200);

      cy.get("body").trigger("mouseup");
    });
};

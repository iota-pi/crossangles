import { COURSE_COLOURS, ColourMap, Colour } from '../state/Colours';
import { ADD_COURSE, SET_COLOUR, AllActions, SET_COURSE_DATA } from '../actions';
import { getCourseId } from '../state/Course';
import { initialState } from '../state';

export function colours (state = initialState.colours, action: AllActions): ColourMap {
  const chosenColours = Object.values(state);
  switch (action.type) {
    case ADD_COURSE:
      const courseId = getCourseId(action.course);
      const colour = action.course.defaultColour || pickColour(chosenColours);
      return {
        ...state,
        [courseId]: colour,
      };
    case SET_COLOUR:
      const newColour = action.colour ? action.colour : pickColour(chosenColours);
      return {
        ...state,
        [action.course]: newColour,
      };
    case SET_COURSE_DATA:
      const additional = action.courses.filter(c => c.isAdditional && c.autoSelect);
      const colourPool = [...COURSE_COLOURS];
      state = Object.assign(
        {},
        ...additional.map(c => {
          const colour = c.defaultColour || pickColour(chosenColours, colourPool);
          colourPool.splice(colourPool.indexOf(colour), 1);
          return { [getCourseId(c)]: colour };
        }),
        state,
      );

      return state;
  }

  return state;
};

function pickColour (chosenColours: Colour[], colourPool: Colour[] = COURSE_COLOURS): Colour {
  // Prefer to choose any colours which haven't been chosen yet
  let canChoose = colourPool.filter(c => !chosenColours.includes(c));

  // All colours have been chosen at least once, so just pick anything
  if (canChoose.length === 0) {
    canChoose = colourPool;
  }

  const i = Math.floor(Math.random() * canChoose.length);
  const colour = canChoose[i];
  return colour;
}

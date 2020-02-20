import { COURSE_COLOURS, ColourMap, Colour } from '../state/Colours';
import { ADD_COURSE, SET_COLOUR, AllActions, SET_COURSE_DATA } from '../actions';
import { getCourseId } from '../state/Course';
import { baseState } from '../state';

export function colours (state = baseState.colours, action: AllActions): ColourMap {
  const chosenColours = Object.values(state);
  switch (action.type) {
    case ADD_COURSE:
      const courseId = getCourseId(action.course);
      const colour = action.course.defaultColour || pickColor(chosenColours);
      return {
        ...state,
        [courseId]: colour,
      };
    case SET_COLOUR:
      const newColour = action.colour ? action.colour : pickColor(chosenColours);
      return {
        ...state,
        [action.course]: newColour,
      };
    case SET_COURSE_DATA:
      const additional = action.courses.filter(c => c.isAdditional && c.autoSelect);
      state = Object.assign(
        {},
        ...additional.map(c => ({
          [getCourseId(c)]: c.defaultColour || pickColor(chosenColours),
        })),
        state,
      );

      return state;
  }

  return state;
};

function pickColor (chosenColours: Colour[]): Colour {
  let canChoose = COURSE_COLOURS.filter(c => !chosenColours.includes(c));
  if (canChoose.length === 0) {
    canChoose = COURSE_COLOURS;
  }

  const i = Math.floor(Math.random() * canChoose.length);
  return canChoose[i];
}

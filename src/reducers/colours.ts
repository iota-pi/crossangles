import { CourseId, baseColours, COURSE_COLOURS } from '../state';
import { ADD_COURSE, CourseAction, ColourAction, SET_COLOUR, OtherAction } from '../actions';

export function colours (state = baseColours, action: CourseAction | ColourAction | OtherAction): Map<CourseId, string> {
  const colours = new Map(state);
  switch (action.type) {
    case ADD_COURSE:
      colours.set(action.course.id, pickColor(Array.from(colours.values())));
      return colours;
    case SET_COLOUR:
      const newColour = action.colour ? action.colour : pickColor(Array.from(colours.values()));
      colours.set(action.course, newColour);
      return colours;
  }

  return state;
};

function pickColor (chosenColours: string[]): string {
  let canChoose = COURSE_COLOURS.filter(c => !chosenColours.includes(c));
  if (canChoose.length === 0) {
    canChoose = COURSE_COLOURS;
  }

  const i = Math.floor(Math.random() * canChoose.length);
  return canChoose[i];
}

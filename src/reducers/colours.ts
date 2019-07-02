import { CourseId, baseColours } from '../state';
import { ColourAction, SET_COLOUR } from '../actions/colours';
import { COURSE_COLOURS } from '../state/colours';

export function colours (state = baseColours, action: ColourAction): Map<CourseId, string> {
  switch (action.type) {
    case SET_COLOUR:
      const colours = new Map(state);
      const newColour = action.colour ? action.colour : pickColor(Array.from(colours.values()));
      colours.set(action.course, newColour);
      return colours;
  }

  return state;
};

function pickColor (chosenColours: string[]): string {
  const notChosenColours = COURSE_COLOURS.filter(c => !chosenColours.includes(c));
  const i = Math.floor(Math.random() * notChosenColours.length);
  return notChosenColours[i];
}

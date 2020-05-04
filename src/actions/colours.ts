import { CourseId } from '../state/Course';
import { Colour } from '../state/Colours';
import { Action } from 'redux';
import ReactGA from 'react-ga';
import { CATEGORY_COURSE_SELECTION } from '../analytics';

// Chosen courses
export const SET_COLOUR = 'SET_COLOUR';

export interface ColourAction extends Action {
  type: typeof SET_COLOUR;
  course: CourseId;
  colour?: Colour;
}

export function setColour (course: CourseId, colour?: Colour): ColourAction {
  ReactGA.event({
    category: CATEGORY_COURSE_SELECTION,
    action: 'change_color',
    label: colour,
  });

  return {
    type: SET_COLOUR,
    course,
    colour,
  }
}

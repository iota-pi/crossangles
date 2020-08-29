import ReactGA from 'react-ga';
import { Action } from 'redux';
import { Colour, CourseId } from '../state';
import { CATEGORY } from '../analytics';

export const SET_COLOUR = 'SET_COLOUR';

export interface ColourAction extends Action {
  type: typeof SET_COLOUR;
  course: CourseId;
  colour?: Colour;
}

export function setColour(course: CourseId, colour?: Colour): ColourAction {
  ReactGA.event({
    category: CATEGORY,
    action: 'Change Colour',
    label: colour,
  });

  return {
    type: SET_COLOUR,
    course,
    colour,
  };
}

import { CourseId } from "../state/Course";
import { Colour } from "../state/Colours";
import { Action } from "redux";

// Chosen courses
export const SET_COLOUR = 'SET_COLOUR';

export interface ColourAction extends Action {
  type: typeof SET_COLOUR;
  course: CourseId;
  colour?: Colour;
}

export function setColour (course: CourseId, colour?: Colour): ColourAction {
  return {
    type: SET_COLOUR,
    course,
    colour,
  }
}

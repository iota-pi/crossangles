import { CourseId } from "../state";
import { Action } from "redux";

// Chosen courses
export const SET_COLOUR = 'SET_COLOUR';

export interface ColourAction extends Action {
  type: typeof SET_COLOUR;
  course: CourseId;
  colour?: string;
}

export function setColour (course: CourseId, colour?: string): ColourAction {
  return {
    type: SET_COLOUR,
    course,
    colour,
  }
}

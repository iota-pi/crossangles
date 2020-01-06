import { CourseId } from "../state/Course";
import { Colour } from "../state/Colours";
import { UserAction } from ".";

// Chosen courses
export const SET_COLOUR = 'SET_COLOUR';

export interface ColourAction extends UserAction {
  type: typeof SET_COLOUR;
  course: CourseId;
  colour?: Colour;
}

export function setColour (course: CourseId, colour?: Colour): ColourAction {
  return {
    type: SET_COLOUR,
    course,
    colour,
    isUser: true,
  }
}

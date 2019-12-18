import { CourseData, CourseId } from "./Course";
import { SessionData } from "./Session";
import { Options } from "./Options";
import { Notice } from "./Notice";

export interface CourseMap {
  [id: string]: CourseData,
}

export interface ColourMap {
  [course: string]: string,
}

export interface Meta {
  term: number;
  year: number;
  updateDate: string;
  updateTime: string;
  signup: string;
}

export type CBSEvent = string;

export interface RootState {
  courses: CourseMap,
  meta: Meta,
  chosen: CourseId[],
  events: CBSEvent[],
  options: Options,
  timetable: SessionData[],
  colours: ColourMap,
  webStreams: CourseId[],
  notice: Notice | null,
}

export const baseState: RootState = {
  courses: {},
  meta: {
    term: 1,
    year: 1960,
    updateDate: '',
    updateTime: '',
    signup: '',
  },
  chosen: [],
  events: [],
  options: {},
  timetable: [],
  colours: {},
  webStreams: [],
  notice: null,
};

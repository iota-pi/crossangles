import { CourseId, CourseMap, CBS_CODE } from './Course';
import { Options } from './Options';
import { Notice } from './Notice';
import { ColourMap, CBS_COLOUR } from './Colours';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';

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
  custom: CourseId[],
  additional: CourseId[],
  meta: Meta,
  chosen: CourseId[],
  events: CBSEvent[],
  options: Options,
  timetable: SessionManagerData,
  colours: ColourMap,
  webStreams: CourseId[],
  notice: Notice | null,
}

export const baseState: RootState = {
  courses: {},
  custom: [],
  additional: [],
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
  timetable: new SessionManager().data,
  colours: { [CBS_CODE]: CBS_COLOUR },
  webStreams: [],
  notice: null,
};

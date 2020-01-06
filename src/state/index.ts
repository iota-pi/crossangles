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

export interface TimetableState {
  courses: CourseMap,
  custom: CourseId[],
  additional: CourseId[],
  chosen: CourseId[],
  events: CBSEvent[],
  options: Options,
  timetable: SessionManagerData,
  colours: ColourMap,
  webStreams: CourseId[],
}

export interface StateHistory {
  past: TimetableState[],
  present: TimetableState,
  future: TimetableState[],
}

export interface RootState extends TimetableState {
  meta: Meta,
  history: StateHistory,
  notice: Notice | null,
}


export const baseTimetableState: TimetableState = {
  courses: {},
  custom: [],
  additional: [],
  chosen: [],
  events: [],
  options: {},
  timetable: new SessionManager().data,
  colours: { [CBS_CODE]: CBS_COLOUR },
  webStreams: [],
}

export const baseState: RootState = {
  ...baseTimetableState,
  meta: {
    term: 1,
    year: 1960,
    updateDate: '',
    updateTime: '',
    signup: '',
  },
  history: {
    past: [],
    present: baseTimetableState,
    future: []
  },
  notice: null,
};

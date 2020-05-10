import { CourseId, CourseMap } from './Course';
import { HistoryData } from './StateHistory';
import { AdditionalEvent } from './Events';
import { ColourMap } from './Colours';
import { Options } from './Options';
import { Notice } from './Notice';
import { Meta, getCurrentTerm } from './Meta';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { Timetables } from './Timetable';
import { getCurrentTimetable } from './selectors';

export * from './Colours';
export * from './Course';
export * from './Events';
export * from './Meta';
export * from './Notice';
export * from './Options';
export * from './selectors';
export * from './Session';
export * from './StateHistory';
export * from './Stream';
export * from './Timetable';


export interface TimetableState {
  courses: CourseMap,
  custom: CourseId[],
  additional: CourseId[],
  chosen: CourseId[],
  events: AdditionalEvent[],
  options: Options,
  colours: ColourMap,
  webStreams: CourseId[],
}

export interface TimetableHistoryState extends TimetableState {
  timetable: SessionManagerData
}

export interface RootState extends TimetableState {
  meta: Meta,
  history: HistoryData,
  notice: Notice | null,
  suggestionScore: number | null,
  hiddenEvents: CourseId[],
  timetables: Timetables,
  darkMode: boolean,
}


export const initialTimetableState: TimetableState = {
  courses: {},
  custom: [],
  additional: [],
  chosen: [],
  events: [],
  options: {},
  colours: {},
  webStreams: [],
};

export const meta: Meta = {
  term: 1,
  year: 1960,
  updateDate: '',
  updateTime: '',
  signup: '',
  source: '',
};

export const timetables: Timetables = {
  [getCurrentTerm(meta)]: new SessionManager().data,
};

export const history: HistoryData = {
  past: [],
  present: {
    ...initialTimetableState,
    timetable: getCurrentTimetable({ timetables, meta }),
  },
  future: [],
};

export const initialState: RootState = {
  ...initialTimetableState,
  timetables,
  meta,
  history,
  notice: null,
  suggestionScore: null,
  hiddenEvents: [],
  darkMode: false,
};

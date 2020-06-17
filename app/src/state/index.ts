import { CourseId, CourseMap } from './Course';
import { HistoryData } from './StateHistory';
import { AdditionalEvent } from './Events';
import { ColourMap } from './Colours';
import { Options } from './Options';
import { Notice } from './Notice';
import { Meta, getCurrentTerm } from './Meta';
import { SessionManagerData, getEmptySessionManagerData } from '../components/Timetable/SessionManagerTypes';
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
  timetable: SessionManagerData,
}

export interface RootState extends TimetableState {
  meta: Meta,
  history: HistoryData,
  notice: Notice | null,
  suggestionScore: number | null,
  unplacedCount: number,
  hiddenEvents: CourseId[],
  timetables: Timetables,
  darkMode: boolean,
  twentyFourHours: boolean,
  compactView: boolean,
  reducedMotion: boolean,
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
  sources: [],
};

export const timetables: Timetables = {
  [getCurrentTerm(meta)]: getEmptySessionManagerData(),
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
  unplacedCount: 0,
  hiddenEvents: [],
  darkMode: false,
  twentyFourHours: false,
  compactView: false,
  reducedMotion: false,
};

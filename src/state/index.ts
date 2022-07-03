import { CourseId, CourseMap } from './Course';
import { HistoryData } from './StateHistory';
import { AdditionalEvent } from './Events';
import { ColourMap } from './Colours';
import { Options } from './Options';
import { Notice } from './Notice';
import { getCurrentTerm, Meta } from './Meta';
import { getEmptySessionManagerData, SessionManagerData } from '../components/Timetable/SessionManagerTypes';
import { Timetables } from './Timetable';
import { getCurrentTimetable } from './selectors';
import { defaultScoreConfig, TimetableScoreConfig } from '../timetable/scoreTimetable';

export * from './Colours';
export * from './Course';
export * from './Events';
export * from './Meta';
export * from './Notice';
export * from './Options';
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
  changelogView: Date,
  hiddenEvents: CourseId[],
  history: HistoryData,
  meta: Meta,
  notice: Notice | null,
  timetables: Timetables,
  scoreConfig: TimetableScoreConfig,
  suggestionScore: number | null,
  unplacedCount: number,
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
  sources: [],
  term: 1,
  termStart: '',
  updateDate: '',
  updateTime: '',
  year: 1960,
};

export const timetables: Timetables = { [getCurrentTerm(meta)]: getEmptySessionManagerData() };

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
  scoreConfig: defaultScoreConfig,
  suggestionScore: null,
  unplacedCount: 0,
  hiddenEvents: [],
  changelogView: new Date(),
};

import { CourseId, CourseMap } from './Course';
import { StateHistory } from './StateHistory';
import { ColourMap } from './Colours';
import { Options } from './Options';
import { Notice } from './Notice';
import { Meta } from './Meta';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';

export type AdditionalEvent = string;

export interface TimetableState {
  courses: CourseMap,
  custom: CourseId[],
  additional: CourseId[],
  chosen: CourseId[],
  events: AdditionalEvent[],
  options: Options,
  timetable: SessionManagerData,
  colours: ColourMap,
  webStreams: CourseId[],
}

export interface RootState extends TimetableState {
  meta: Meta,
  history: StateHistory,
  notice: Notice | null,
  suggestionScore: number | null,
  hiddenEvents: CourseId[],
}


export const baseTimetableState: TimetableState = {
  courses: {},
  custom: [],
  additional: [],
  chosen: [],
  events: [],
  options: {},
  timetable: new SessionManager().data,
  colours: {},
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
    promoText: '',
    linkText: '',
    linkURL: '',
    source: '',
  },
  history: {
    past: [],
    present: baseTimetableState,
    future: []
  },
  notice: null,
  suggestionScore: null,
  hiddenEvents: [],
};

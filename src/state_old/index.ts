import { ReactNode } from "react";
import { Course, CourseId, CBS_CODE } from './Course';
import { Session, ILinkedSession } from './Session';
import { CBS_COLOUR } from './colours';
import { ILinkedSessionManager } from "../components/Timetable/SessionManager";
import { CourseManager } from "./CourseManager";
export * from './Course';
export * from './Stream';
export * from './Session';
export * from './colours';

export interface Meta {
  term: number;
  year: number;
  updateDate: string;
  updateTime: string;
  signup: string;
}

export type CBSEvent = 'The Bible Talks' | 'Bible Study' | 'Core Theology' | 'Core Training';
export const CBSEventList: CBSEvent[] = ['The Bible Talks', 'Bible Study', 'Core Theology', 'Core Training'];

export interface Options {
  showEnrolments: boolean;
  showLocations: boolean;
  showWeeks: boolean;
  includeFull: boolean;
}
export type OptionName = keyof Options;
export const OptionList = new Map<OptionName, string>([
  ['showEnrolments', 'Show Enrolments'],
  ['showLocations', 'Show Locations'],
  ['showWeeks', 'Show Weeks'],
  ['includeFull', 'Include full classes'],
]);

export class CustomCourse extends Course {};

export type Timetable = Session[];
export type LinkedTimetable = ILinkedSession[];

export interface Notice {
  message: string,
  actions: ReactNode,
}

// Initial values
export const baseCourses = new CourseManager();
export const baseMeta: Meta = {
  term: 1,
  year: 1960,
  updateDate: '',
  updateTime: '',
  signup: '',
}
export const baseChosen: CourseId[] = [];
export const baseEvents: CBSEvent[] = [];
export const baseOptions: Options = {
  showEnrolments: false,
  showLocations: false,
  showWeeks: false,
  includeFull: false,
};
export const baseColours = new Map<CourseId, string>([[CBS_CODE, CBS_COLOUR]]);
export const baseWebStreams = new Set<CourseId>();
export const baseNotice: Notice | null = null;

export interface RootState {
  courses: CourseManager,
  meta: Meta,
  chosen: CourseId[],
  events: CBSEvent[],
  options: Options,
  sessionManager: ILinkedSessionManager,
  colours: Map<CourseId, string>,
  webStreams: Set<CourseId>,
  notice: Notice | null,
}

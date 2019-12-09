import { ReactNode } from "react";
import { Course, CourseId, CBS_CODE, CourseMap } from './Course';
import { Session, ILinkedSession } from './Session';
import { CBS_COLOUR } from './colours';
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
export const baseCourses = new Map<CourseId, Course>();
export const baseMeta: Meta = {
  term: 1,
  year: 1960,
  updateDate: '',
  updateTime: '',
  signup: '',
}
export const baseChosen: CourseId[] = [];
export const baseAdditional: CourseId[] = [];
export const baseEvents: CBSEvent[] = [];
export const baseOptions: Options = {
  showEnrolments: false,
  showLocations: false,
  showWeeks: false,
  includeFull: false,
};
export const baseCustom: CustomCourse[] = [];
export const baseTimetable: LinkedTimetable = [];
export const baseTimetableVersion: number = 0;
export const baseColours = new Map<CourseId, string>([[CBS_CODE, CBS_COLOUR]]);
export const baseWebStreams = new Set<CourseId>();
export const baseNotice: Notice | null = null;

export interface RootState {
  courses: CourseMap,
  meta: Meta,
  chosen: CourseId[],
  additional: CourseId[],
  events: CBSEvent[],
  options: Options,
  custom: CustomCourse[],
  timetable: LinkedTimetable,
  timetableVersion: number,
  colours: Map<CourseId, string>,
  webStreams: Set<CourseId>,
  notice: Notice | null,
}

export const baseState: RootState = {
  courses: baseCourses,
  meta: baseMeta,
  chosen: baseChosen,
  additional: baseAdditional,
  events: baseEvents,
  options: baseOptions,
  custom: baseCustom,
  timetable: baseTimetable,
  timetableVersion: baseTimetableVersion,
  colours: baseColours,
  webStreams: baseWebStreams,
  notice: baseNotice,
}

export const getAllCourses = (state: RootState) => {
  const allCourses = new Map(state.courses);
  for (const custom of state.custom) {
    allCourses.set(custom.code, custom);
  }
  return allCourses;
}

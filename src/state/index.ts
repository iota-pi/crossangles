import { Course, CourseId } from "./Course";
import Stream, { Session } from "./Stream";
export * from "./Course";
export * from "./Stream";

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

export type CustomCourse = Course;

export type Timetable = Session[];


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
export const baseEvents: CBSEvent[] = ['The Bible Talks'];
export const baseOptions: Options = {
  showEnrolments: false,
  showLocations: false,
  showWeeks: false,
  includeFull: false,
};
export const baseCustom: CustomCourse[] = [];
export const baseTimetable: Timetable = [];

export interface RootState {
  courses: Map<CourseId, Course>;
  meta: Meta;
  chosen: CourseId[];
  additional: CourseId[];
  events: CBSEvent[];
  options: Options;
  custom: CustomCourse[];
  timetable: Timetable;
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
}

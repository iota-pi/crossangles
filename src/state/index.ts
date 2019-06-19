import { Course, CourseId } from "./Course";
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
export const OptionList: OptionName[] = ['showEnrolments', 'showLocations', 'showWeeks', 'includeFull'];

export type CustomCourse = Course;

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

export interface RootState {
  courses: Map<CourseId, Course>;
  meta: Meta;
  chosen: CourseId[];
  additional: CourseId[];
  events: CBSEvent[];
  options: Options;
  custom: CustomCourse[];
}

export const baseState: RootState = {
  courses: baseCourses,
  meta: baseMeta,
  chosen: baseChosen,
  additional: baseAdditional,
  events: baseEvents,
  options: baseOptions,
  custom: baseCustom,
}

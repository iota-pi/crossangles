import { Course } from "./Course";

export interface RootState {
  courses: Course[];
  meta: Meta;
  chosen: Course[];
  events: CBSEvent[];
  options: Options;
  custom: CustomCourse[];
}

export interface Meta {
  term: number;
  year: number;
  updateDate: string;
  updateTime: string;
  signup: string;
}

export type CBSEvent = 'The Bible Talks' | 'Bible Study' | 'Core Theology' | 'Core Training';

export interface Options {
  showEnrolments: boolean;
  showLocations: boolean;
  showWeeks: boolean;
  includeFull: boolean;
}

export type CustomCourse = Course;

export const baseCourses: Course[] = [];
export const baseMeta: Meta = {
  term: 1,
  year: 1960,
  updateDate: '',
  updateTime: '',
  signup: '',
}
export const baseChosen: Course[] = [];
export const baseEvents: CBSEvent[] = ['The Bible Talks'];
export const baseOptions: Options = {
  showEnrolments: false,
  showLocations: false,
  showWeeks: false,
  includeFull: false,
};
export const baseCustom: CustomCourse[] = [];

export const baseState: RootState = {
  courses: baseCourses,
  meta: baseMeta,
  chosen: baseChosen,
  events: baseEvents,
  options: baseOptions,
  custom: baseCustom,
}

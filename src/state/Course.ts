import { StreamData } from './Stream';
import { MinistryMeta } from './Meta';
import { Colour } from './Colours';

export type CourseId = string;

export enum Career {
  UGRD = 1,
  PGRD = 2,
}

export interface CourseData {
  code: string,
  name: string,
  streams: StreamData[],
  term?: string,
  section?: string,
  career?: Career,
  isCustom?: boolean,
  isAdditional?: boolean,
  autoSelect?: boolean,
  defaultColour?: Colour,
  description?: string,
  metadata?: MinistryMeta,
}

export interface CourseMap {
  [id: string]: CourseData,
}


export const getCourseId = (course: CourseData): CourseId => {
  const extraSegments = [
    course.code,
    course.term,
    course.section,
    course.career === Career.PGRD ? 'PGRD' : undefined,
  ];
  return extraSegments.filter(x => !!x).join('~');
}

export const hasWebStream = (course: CourseData): boolean => {
  return getWebStream(course) !== null;
}

export const getWebStream = (course: CourseData): StreamData | null => {
  const streams = course.streams;
  for (let i = 0; i < streams.length; ++i) {
    if (streams[i].web) {
      return streams[i];
    }
  }

  return null;
}

export const getComponents = (course: CourseData) => {
  const components = course.streams.map(s => s.component);
  return components.filter((c, i) => components.indexOf(c) === i);
}

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);
export const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name);

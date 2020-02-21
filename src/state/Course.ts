import { StreamData } from "./Stream";
import { Colour } from "./Colours";

export type CourseId = string;

export interface CourseData {
  code: string,
  name: string,
  streams: StreamData[],
  term?: string | null,
  isCustom?: boolean,
  isAdditional?: boolean,
  autoSelect?: boolean,
  defaultColour?: Colour;
}

export interface CourseMap {
  [id: string]: CourseData,
}


export const getCourseId = (course: CourseData): CourseId => {
  return course.code + (course.term || '');
}

export const hasWebStream = (course: CourseData): boolean => {
  const streams = course.streams;
  for (let i = 0; i < streams.length; ++i) {
    if (streams[i].web) {
      return true;
    }
  }

  return false;
}

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);
export const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name);

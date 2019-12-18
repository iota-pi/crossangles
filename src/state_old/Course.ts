import { CourseData } from '../state';

export const CBS_CODE = 'CBS';

export type CourseId = string;


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

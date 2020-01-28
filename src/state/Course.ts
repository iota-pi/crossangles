import { StreamData, StreamId, getStreamId } from "./Stream";

export type CourseId = string;

export interface CourseData {
  code: string,
  name: string,
  streams: StreamData[],
  term?: string | null,
  isCustom?: boolean,
  isAdditional?: boolean,
  autoSelect?: boolean,
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

export const getStream = (course: CourseData, streamId: StreamId): StreamData => {
  for (let stream of course.streams) {
    if (getStreamId(course, stream) === streamId) {
      return stream;
    }
  }

  throw new Error(`No stream with id ${streamId} in course ${getCourseId(course)}`);
}

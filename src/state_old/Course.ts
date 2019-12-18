import { Stream, RawStreamData, StreamData } from './Stream';

export const CBS_CODE = 'CBS';

export type CourseId = string;

export interface RawCourseData {
  code: string;
  name: string;
}

export interface CourseData {
  code: string;
  name: string;
  streams: StreamData[];
  term?: string | null;
  isCustom?: boolean;
}

export class Course {
  code: string;
  name: string;
  streams: Stream[];
  term: string | null;
  isCustom: boolean;

  constructor(courseData: CourseData) {
    this.code = courseData.code;
    this.name = courseData.name;
    this.streams = courseData.streams.map(s => new Stream({ ...s, course: this }));
    this.term = courseData.term || null;
    this.isCustom = courseData.isCustom || false;
  }

  get data (): CourseData {
    return {
      code: this.code,
      name: this.name,
      streams: this.streams.map(s => s.data),
      term: this.term,
      isCustom: this.isCustom,
    }
  }

  get id (): CourseId {
    return this.code + (this.term || '');
  }

  get hasWebStream () {
    // TODO: cache
    return this.streams.filter(stream => stream.web).length > 0;
  }
}

export default Course;

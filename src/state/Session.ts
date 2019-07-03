import { Course, CourseId } from './Course';
import { Stream, StreamId } from './Stream';

export type LetterDay = 'M' | 'T' | 'W' | 'H' | 'F';

export interface SessionLinks {
  course: CourseId;
  stream: StreamId;
  index: number;
}

export interface SessionMappedLinks {
  course: Course;
  stream: Stream;
  index: number;
}

export interface CommonSession {
  start: number;
  end: number;
  day: LetterDay;
  canClash?: boolean;
  location?: string;
  weeks?: string;
}

export interface BasicSession extends CommonSession, Partial<SessionLinks> {}

export interface Session extends CommonSession, SessionLinks {}
export interface MappedSession extends CommonSession, SessionMappedLinks {}

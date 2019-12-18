import { CourseData, CourseId } from './Course';
import { StreamData, StreamId, getStreamId } from './Stream';

export type SessionId = string;

export type DayLetter = 'M' | 'T' | 'W' | 'H' | 'F';

export interface SessionData {
  index: number,
  start: number,
  end: number,
  day: DayLetter,
  component?: string,
  canClash?: boolean,
  location?: string,
  weeks?: string,
  course: CourseId,
  stream: StreamId,
}


export const getSessionId = (course: CourseData, stream: StreamData, session: SessionData) => {
  const streamId = getStreamId(course, stream);
  return `${streamId}-${session.index}`
}

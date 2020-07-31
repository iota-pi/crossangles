import { CourseData, CourseId, getCourseId } from './Course';
import { StreamData, StreamId, getStreamId, LinkedStream } from './Stream';

export type SessionId = string;

export type DayLetter = 'M' | 'T' | 'W' | 'H' | 'F';

export interface SessionCommon {
  index: number,
  start: number,
  end: number,
  day: DayLetter,
  canClash?: boolean,
  location?: string,
  weeks?: string,
}

export interface SessionData extends SessionCommon {
  course: CourseId,
  stream: StreamId,
}

export interface LinkedSession extends SessionCommon {
  course: CourseData,
  stream: LinkedStream,
  id: SessionId,
}


export function getSessionId(course: CourseData, stream: StreamData, session: SessionData) {
  const streamId = getStreamId(course, stream);
  return `${streamId}~${session.index}`;
}

export const getDuration = (session: SessionData | LinkedSession): number => session.end - session.start;

export const linkSession = (course: CourseData, stream: LinkedStream, session: SessionData): LinkedSession => ({
  ...session,
  course,
  stream,
  id: getSessionId(course, stream, session),
});

export const unlinkSession = (session: LinkedSession): SessionData => ({
  index: session.index,
  start: session.start,
  end: session.end,
  day: session.day,
  canClash: session.canClash,
  location: session.location,
  weeks: session.weeks,
  course: getCourseId(session.course),
  stream: getStreamId(session.course, session.stream),
});

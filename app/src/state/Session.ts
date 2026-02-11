import { CourseData, CourseId, getCourseId } from './Course'
import { StreamData, StreamId, getStreamId, LinkedStream } from './Stream'

export type SessionId = string

export type DayLetter = 'M' | 'T' | 'W' | 'H' | 'F' | 'S' | 's'
export const WEEKDAY_DAYS: DayLetter[] = ['M', 'T', 'W', 'H', 'F']
export const ALL_DAYS: DayLetter[] = ['M', 'T', 'W', 'H', 'F', 'S', 's']

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
  const streamId = getStreamId(course, stream)
  return `${streamId}~${session.index}`
}

export function getDuration(session: SessionData | LinkedSession): number {
  return session.end - session.start
}

export function linkSession(
  course: CourseData, stream: LinkedStream, session: SessionData,
): LinkedSession {
  const id = getSessionId(course, stream, session)
  return { ...session, course, stream, id }
}

export function unlinkSession(session: LinkedSession): SessionData {
  const course = getCourseId(session.course)
  const stream = getStreamId(session.course, session.stream)
  const { index, day, start, end, canClash, location, weeks } = session
  return {
    course,
    stream,
    index,
    start,
    end,
    day,
    canClash,
    location,
    weeks,
  }
}

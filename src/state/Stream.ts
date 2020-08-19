import { SessionData, DayLetter, LinkedSession, linkSession } from './Session';
import { CourseData, getCourseId } from './Course';

export type StreamId = string;

export enum DeliveryType {
  person,
  online,
  either,
  mixed,
}

export interface StreamData {
  component: string,
  times: ClassTime[] | null,
  enrols?: [number, number],
  full?: boolean,
  web?: boolean,
  delivery?: DeliveryType,
  notes?: string,
}

export interface LinkedStream extends StreamData {
  course: CourseData,
  sessions: LinkedSession[],
  id: StreamId,
}

export interface ClassTime {
  time: string,
  location?: string,
  weeks?: string,
  canClash?: boolean,
}


export function getStreamId(course: CourseData, stream: StreamData, simple = false) {
  const timeString = stream.times ? stream.times.map(t => t.time).join(',') : 'WEB';
  const id = `${getComponentId(course, stream, simple)}~${timeString}`;
  return id;
}

export function getComponentId(course: CourseData, stream: StreamData, simple = false) {
  const componentString = course.isCustom ? '' : stream.component;
  return `${getCourseId(course, simple)}~${componentString}`;
}

export function getSessions(course: CourseData, stream: StreamData): SessionData[] {
  const courseId = getCourseId(course);
  const streamId = getStreamId(course, stream);
  if (stream.times !== null) {
    return stream.times.map((t, i): SessionData => {
      const [startHour, endHour] = t.time.substr(1).split('-').map(x => parseFloat(x));
      return {
        start: startHour,
        end: endHour || (startHour + 1),
        day: t.time.charAt(0) as DayLetter,
        canClash: t.canClash,
        location: t.location,
        index: i,
        weeks: t.weeks,
        stream: streamId,
        course: courseId,
      };
    });
  }
  return [];
}

export function linkStream(course: CourseData, stream: StreamData): LinkedStream {
  const sessionData = getSessions(course, stream);
  const linkedStream: LinkedStream = {
    ...stream,
    course,
    sessions: [],
    id: getStreamId(course, stream),
  };
  linkedStream.sessions = sessionData.map(session => linkSession(course, linkedStream, session));
  return linkedStream;
}

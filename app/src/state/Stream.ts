import { SessionData, DayLetter, LinkedSession, linkSession } from './Session';
import { CourseData, getCourseId } from './Course';

export type StreamId = string;

export interface StreamData {
  component: string,
  enrols: [number, number],
  times: ClassTime[] | null,
  full?: boolean,
  web?: boolean,
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


export const getStreamId = (course: CourseData, stream: StreamData) => {
  const timeString = stream.times ? stream.times.map(t => t.time).join(',') : 'WEB';
  const componentString = course.isCustom ? '' : stream.component;
  const id = `${getCourseId(course)}~${componentString}~${timeString}`;
  return id;
}

export const getSessions = (course: CourseData, stream: StreamData): SessionData[] => {
  const courseId = getCourseId(course);
  const streamId = getStreamId(course, stream);
  if (stream.times !== null) {
    return stream.times.map((t, i) => {
      const [ startHour, endHour ] = t.time.substr(1).split('-').map(x => parseFloat(x));

      return {
        start: startHour,
        end: endHour || (startHour + 1),
        day: t.time.charAt(0) as DayLetter,
        canClash: t.canClash,
        location: t.location,
        index: i,
        weeks: t.weeks,
        component: stream.component,
        stream: streamId,
        course: courseId,
      };
    });
  } else {
    return [];
  }
}

export const linkStream = (course: CourseData, stream: StreamData): LinkedStream => {
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

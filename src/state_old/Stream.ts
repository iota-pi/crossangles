import { ClassTime } from './times';
import { DayLetter, ILinkedSession } from './Session';
import { CourseData } from '../state';
import { getCourseId } from './Course';

export type StreamId = string;

export interface StreamData {
  component: string;
  enrols: [number, number];
  times: ClassTime[] | null;
  full: boolean;
  web?: boolean;
}


export const getStreamId = (course: CourseData, stream: StreamData) => {
  const timeString = stream.times ? stream.times.map(t => t.time).join(',') : 'WEB';
  const id = `${getCourseId(course)}-${stream.component}-${timeString}`;
  return id;
}

export const getSessions = (course: CourseData, stream: StreamData): ILinkedSession[] => {
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
        stream: streamId,
        course: courseId,
      };
    });
  } else {
    return [];
  }
}

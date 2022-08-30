import { SessionData, DayLetter, LinkedSession, linkSession } from './Session';
import { CourseData, getCourseId } from './Course';

const ONE_DAY = 1000 * 60 * 60 * 24;

export type StreamId = string;

export enum DeliveryType {
  person,
  online,
  either,
  mixed,
}

export interface StreamData<C extends string = string> {
  component: C,
  times: ClassTime[],
  enrols?: [number, number],
  full?: boolean,
  web?: boolean,
  offering?: string,
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

export function getComponentName(stream: Pick<StreamData, 'component'>) {
  const code = stream.component;
  const nameMap: { [key: string]: string } = {
    CLN: 'Clinical',
    EXM: 'Exam',
    FLD: 'Field Studies',
    HON: 'Honours',
    LAB: 'Lab',
    LA1: 'Lab (1)',
    LA2: 'Lab (2)',
    LEC: 'Lecture',
    LE1: 'Lecture (1)',
    LE2: 'Lecture (2)',
    OTH: 'Other',
    PRJ: 'Project',
    SEM: 'Seminar',
    STD: 'Studio',
    THE: 'Thesis',
    TLB: 'Tutorial-Laboratory',
    TUT: 'Tutorial',
    TU1: 'Tutorial (1)',
    TU2: 'Tutorial (2)',
    WEB: 'Lecture',
  };
  return nameMap[code.toUpperCase()] || code;
}

export function getSessions(course: CourseData, stream: StreamData): SessionData[] {
  const courseId = getCourseId(course);
  const streamId = getStreamId(course, stream);
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

export function getOfferingStart(offering: string) {
  return offering.split(/[\s-]+/g)[0];
}

export function getTermStart(streams: StreamData[]): Date {
  const offeringStarts: Record<string, number> = {};
  for (const stream of streams) {
    if (stream.offering) {
      const offeringStart = getOfferingStart(stream.offering);
      offeringStarts[offeringStart] = (offeringStarts[offeringStart] || 0) + 1;
    }
  }
  let mostCommonOffering: string | null = null;
  let mostCommonOfferingCount = 0;
  for (const [offering, count] of Object.entries(offeringStarts)) {
    if (count > mostCommonOfferingCount) {
      mostCommonOffering = offering;
      mostCommonOfferingCount = count;
    }
  }
  const termStart = mostCommonOffering ? parseBackwardsDateString(mostCommonOffering) : new Date();
  return closestMonday(termStart);
}

// Parse date strings in format: dd/mm/yyyy
export function parseBackwardsDateString(dateString: string) {
  const [day, month, year] = dateString.trim().split(/[/-]/g);
  return new Date(+year, +month - 1, +day);
}

export function closestMonday(date: Date) {
  const weekday = date.getDay();
  const differenceInDays = weekday < 6 ? 1 - weekday : 2;
  const differenceInMS = ONE_DAY * differenceInDays;
  return new Date(date.getTime() + differenceInMS);
}

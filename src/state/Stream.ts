import { parseTimeStr, ClassTime } from './times';
import { Course } from './Course';
import { Session, LetterDay } from './Session';

export type StreamId = string;

export interface RawStreamData {
  component: string,
  section: string,
  enrols: string,
  times: string,
  status: string,
}

export interface StreamData {
  component: string;
  enrols: [number, number];
  times: ClassTime[] | null;
  full: boolean;
  web?: boolean;
}

export class Stream {
  component: string;
  enrols: [number, number];
  times: ClassTime[] | null;
  full: boolean;
  web: boolean;
  sessions: Session[];
  course: Course;

  constructor(streamData: StreamData & { course: Course }) {
    this.component = streamData.component;
    this.enrols = streamData.enrols;
    this.times = streamData.times;
    this.full = streamData.full;
    this.web = streamData.web || false;
    this.course = streamData.course;
    this.sessions = this.getSessions(); // TODO: if too slow, could only call for streams of chosen courses
  }

  static from (data: RawStreamData, course: Course) {
    let component = data.component;
    if (component === 'CRS') {
      return null;
    }

    const status = data.status.trim().replace(/\*$/, '').toLocaleLowerCase();
    if (status !== 'open' && status !== 'full') {
      return null;
    }
    const full = status === 'full';

    const enrols = data.enrols.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
    if (enrols[1] === 0) {
      return null;
    }

    let web = false;
    let times: ClassTime[] | null = null;
    if (data.section.indexOf('WEB') === -1) {
      times = parseTimeStr(data.times);

      if (times === null || times.length === 0) {
        return null;
      }
    } else {
      web = true;

      // Standardise all web streams as 'LEC' component
      component = 'LEC';
    }

    return new Stream({ component, enrols, times, full, web, course });
  }

  get data (): StreamData {
    return {
      component: this.component,
      enrols: this.enrols,
      times: this.times,
      full: this.full,
      web: this.web,
    }
  }

  get id (): string {
    // Condition: id will be unique iff there is at most one WEB stream per course
    let timeStr = this.times ? this.times.map(t => t.time).join(',') : 'WEB';
    return `${this.course.id}-${this.component}-${timeStr}`;
  }

  private getSessions (): Session[] {
    if (this.times === null) {
      return [];
    } else {
      return this.times.map(t => {
        const hours = t.time.substr(1).split('-').map(x => parseFloat(x));
        return {
          start: hours[0],
          end: hours[1] || (hours[0] + 1),
          day: t.time.charAt(0) as LetterDay,
          canClash: t.canClash,
          location: t.location,
          weeks: t.weeks,
          stream: this.id,
          course: this.course.id,
        }
      })
    }
  }
}

export default Stream;

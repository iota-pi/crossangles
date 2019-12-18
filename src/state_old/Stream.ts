import { ClassTime } from './times';
import { Course } from './Course';
import { DayLetter, ILinkedSession } from './Session';

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
  sessions: ILinkedSession[];
  course: Course;
  private timeString: string;
  id: StreamId;

  constructor(streamData: StreamData & { course: Course }) {
    this.component = streamData.component;
    this.enrols = streamData.enrols;
    this.times = streamData.times;
    this.full = streamData.full;
    this.web = streamData.web || false;
    this.course = streamData.course;

    // Condition: id will be unique iff there is at most one WEB stream per course
    this.timeString = this.times ? this.times.map(t => t.time).join(',') : 'WEB';
    this.id = `${this.course.id}-${this.component}-${this.timeString}`;

    this.sessions = this.getSessions(); // TODO: if too slow, could only call for streams of chosen courses
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

  private getSessions (): ILinkedSession[] {
    if (this.times !== null) {
      return this.times.map((t, i) => {
        const [ startHour, endHour ] = t.time.substr(1).split('-').map(x => parseFloat(x));

        return {
          start: startHour,
          end: endHour || (startHour + 1),
          day: t.time.charAt(0) as DayLetter,
          canClash: t.canClash,
          location: t.location,
          index: i,
          weeks: t.weeks,
          stream: this.id,
          course: this.course.id,
        };
      });
    } else {
      return [];
    }
  }
}

export default Stream;

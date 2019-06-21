import { parseTimeStr, ClassTime } from "./times";
import Course from "./Course";

export type LetterDay = 'M' | 'T' | 'W' | 'H' | 'F';

export interface Session {
  start: number;
  end: number;
  day: LetterDay;
  canClash?: boolean;
  location?: string;
  weeks?: string;
  stream?: Stream;
  course?: Course;
}

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

  constructor(streamData: StreamData) {
    this.component = streamData.component;
    this.enrols = streamData.enrols;
    this.times = streamData.times;
    this.full = streamData.full;
    this.web = streamData.web || false;
    this.sessions = this.getSessions(); // TODO: if too slow, could only call for streams of chosen courses
  }

  static from (data: RawStreamData) {
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

    return new Stream({ component, enrols, times, full, web });
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
        }
      })
    }
  }
}

export default Stream;

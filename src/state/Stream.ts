import { parseTimeStr, ClassTime } from "./util";

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

  constructor(streamData: StreamData) {
    this.component = streamData.component;
    this.enrols = streamData.enrols;
    this.times = streamData.times;
    this.full = streamData.full;
    this.web = streamData.web || false;
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
}

export default Stream;

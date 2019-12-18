export interface Meta {
  term: number;
  year: number;
  updateDate: string;
  updateTime: string;
  signup: string;
}

export interface Options {
  showEnrolments: boolean;
  showLocations: boolean;
  showWeeks: boolean;
  includeFull: boolean;
}

export interface CourseData {
  code: string,
  name: string,
  streams: StreamData[],
  term?: string | null,
  isCustom?: boolean,
}

export interface StreamData {
  component: string,
  enrols: [number, number],
  times: ClassTime[] | null,
  full: boolean,
  web?: boolean,
}

export interface ClassTime {
  time: string,
  location?: string,
  weeks?: string,
  canClash?: boolean,
}

import { Stream, RawStreamData } from './Stream';
const CourseNames = require('../../src/assets/courses.json');

export const CBS_CODE = 'CBS';

export type CourseId = string;

export interface RawCourseData {
  code: string;
  name: string;
}

export interface CourseData {
  code: string;
  name: string;
  streams: Stream[];
  term?: string | null;
  useWebStream?: boolean;
}

export class Course {
  code: string;
  name: string;
  streams: Stream[];
  term: string | null;
  useWebStream: boolean;

  constructor(courseData: CourseData) {
    this.code = courseData.code;
    this.name = courseData.name;
    this.streams = courseData.streams;
    this.term = courseData.term || null;
    this.useWebStream = courseData.useWebStream || false;
  }

  static from (data: RawCourseData) {
    const code = data.code.trim();
    return new Course({
      code: code,
      name: (CourseNames[code]) || data.name.trim(),
      streams: [],
      term: (/ \(([A-Z][A-Z0-9]{2})\)/.exec(data.name) || [])[1],
    });
  }

  get data (): CourseData {
    return {
      code: this.code,
      name: this.name,
      streams: this.streams,
      term: this.term,
      useWebStream: this.useWebStream,
    }
  }

  get id (): CourseId {
    return this.code + (this.term || '');
  }

  addStream (data: RawStreamData) {
    const stream = Stream.from(data);
    if (stream !== null) {
      this.streams.push(stream);
    }
  }

  updateWith (data: Partial<CourseData>) {
    return new Course({
      ...this.data,
      ...data,
    });
  }

  removeDuplicates () {
    const mapping = new Map<string, Stream[]>();
    for (let stream of this.streams) {
      const times = stream.times !== null ? stream.times.map(t => t.time) : null;
      const key = stream.component + `[${times}]`;
      mapping.set(key, (mapping.get(key) || []).concat(stream));
    }

    // For each set of streams with identical component and times,
    for (const streams of Array.from(mapping.values())) {
      const emptiest = emptiestStream(streams);
      for (let stream of streams) {
        if (stream !== emptiest) {
          this.streams.splice(this.streams.indexOf(stream), 1);
        }
      }
    }
  }

  get hasWebStream () {
    return this.streams.filter(stream => stream.web).length > 0;
  }
}

const emptiestStream = (streams: Stream[]) => {
  let bestStream = null;
  let bestRatio = Infinity;
  for (let stream of streams) {
    const ratio = stream.enrols[0] / stream.enrols[1];
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestStream = stream;
    }
  }

  return bestStream!;
}

export default Course;

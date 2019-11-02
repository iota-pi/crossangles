import { Course, CourseId } from './Course';
import { Stream, StreamId } from './Stream';
import { notUndefined, notNull } from '../typeHelpers';

export type SessionId = string;

export type DayLetter = 'M' | 'T' | 'W' | 'H' | 'F';

interface ISessionCommon {
  index: number;
  start: number;
  end: number;
  day: DayLetter;
  component?: string;
  canClash?: boolean;
  location?: string;
  weeks?: string;
}

export interface ISession extends ISessionCommon {
  course: Course;
  stream: Stream;
}

export interface ILinkedSession extends ISessionCommon {
  course: CourseId;
  stream: StreamId;
}

export class Session {
  private _course: Course;
  private _stream: Stream;
  private _index: number;
  private _start: number;
  private _end: number;
  private _day: DayLetter;
  private _canClash?: boolean;
  private _location?: string;
  private _weeks?: string;

  constructor (session: ISession) {
    this._course = session.course;
    this._stream = session.stream;
    this._index = session.index;
    this._start = session.start;
    this._end = session.end;
    this._day = session.day;
    this._canClash = session.canClash;
    this._location = session.location;
    this._weeks = session.weeks;
  }

  static from (linkedSession: ILinkedSession, courses: Map<CourseId, Course>): Session {
    const course = notUndefined(courses.get(linkedSession.course));

    let stream = null;
    for (let i = 0; i < course.streams.length; ++i) {
      stream = course.streams[i];
      if (course.streams[i].id === linkedSession.stream) {
        break;
      }
    }
    stream = notNull(stream);

    return new Session({
      ...linkedSession,
      course,
      stream,
    });
  }

  static getId (session: ILinkedSession): SessionId {
    return `${session.stream}-${session.index}`;
  }

  get course (): Course {
    return this._course;
  }

  get stream (): Stream {
    return this._stream;
  }

  get index (): number {
    return this._index;
  }

  get start (): number {
    return this._start;
  }

  get end (): number {
    return this._end;
  }

  get day (): DayLetter {
    return this._day;
  }

  get id (): SessionId {
    return `${this._stream.id}-${this._index}`;
  }

  get component (): string {
    return this._stream.component;
  }

  get canClash (): boolean {
    return this._canClash || false;
  }

  get location (): string | undefined {
    return this._location;
  }

  get weeks (): string | undefined {
    return this._weeks;
  }

  serialise (): ILinkedSession {
    return {
      course: this._course.id,
      stream: this._stream.id,
      index: this._index,
      start: this._start,
      end: this._end,
      day: this._day,
      component: this.component,
      canClash: this._canClash,
      location: this._location,
      weeks: this._weeks,
    }
  }
}

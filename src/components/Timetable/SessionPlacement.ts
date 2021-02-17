import { TimetablePosition, Dimensions } from './timetableTypes';
import { TimetablePlacement } from './Placement';
import * as tt from './timetableUtil';
import {
  CourseData,
  getStreamId,
  linkStream,
  SessionData,
  unlinkSession,
  linkSession,
} from '../../state';

export interface SessionPlacementData {
  offset: TimetablePosition,
  isSnapped: boolean,
  isDragging: boolean,
  isRaised: boolean,
  touched: boolean,
  clashDepth: number,
  session: SessionData,
}

class SessionPlacement extends TimetablePlacement {
  private _touched: boolean = false;

  get data(): SessionPlacementData {
    return {
      offset: { ...this._offset },
      isSnapped: this._isSnapped,
      isDragging: this._isDragging,
      isRaised: this._isRaised,
      touched: this._touched,
      clashDepth: this.clashDepth,
      session: unlinkSession(this.session),
    };
  }

  static from(data: SessionPlacementData, course: CourseData) {
    // Get linked session
    const streamId = data.session.stream;
    const stream = course.streams.filter(s => getStreamId(course, s) === streamId)[0];
    if (stream === undefined) {
      return null;
    }

    const linkedStream = linkStream(course, stream);
    const session = linkSession(course, linkedStream, data.session);
    const placement = new SessionPlacement(session);

    // Update placement properties
    placement._offset = { ...data.offset };
    placement._isSnapped = data.isSnapped;
    placement._isDragging = data.isDragging;
    placement._isRaised = data.isRaised;
    placement._touched = data.touched;
    placement.clashDepth = data.clashDepth;

    return placement;
  }

  drag(): void {
    // Add clashOffset to current offset
    this._offset.x += this.clashDepth * tt.CLASH_OFFSET_X;
    this._offset.y += this.clashDepth * tt.CLASH_OFFSET_Y;

    this._isSnapped = false;
    this._isDragging = true;
  }

  move(delta: TimetablePosition): void {
    this._offset.x += delta.x;
    this._offset.y += delta.y;
  }

  drop(
    timetableDimensions: Dimensions,
    firstHour: number,
    compact: boolean,
    showMode: boolean,
  ): void {
    this._isDragging = false;

    // Update offset based on current (rendered) position and base position
    // NB: this is done to ensure the offset stays bounded within the timetable element
    const base = this.basePlacement(timetableDimensions, firstHour, compact, showMode);
    const current = this.getPosition(timetableDimensions, firstHour, compact, showMode);
    this._offset.x = current.x - base.x;
    this._offset.y = current.y - base.y;
  }

  snap(): void {
    this._offset = { x: 0, y: 0 };
    this._isSnapped = true;
    this._isRaised = false;
  }

  raise(): void {
    this._isRaised = true;
  }

  lower(): void {
    this._isRaised = false;
  }

  // Slightly displace this session
  // (e.g. if it was in a full stream and can't be anymore)
  displace(): void {
    let dx = Math.floor(Math.random() * tt.DISPLACE_VARIATION_X * 2) - tt.DISPLACE_VARIATION_X;
    let dy = Math.floor(Math.random() * tt.DISPLACE_VARIATION_Y * 2) - tt.DISPLACE_VARIATION_Y;
    dx = (dx < 0) ? dx - tt.DISPLACE_RADIUS_X : dx + tt.DISPLACE_RADIUS_X + 1;
    dy = (dy < 0) ? dy - tt.DISPLACE_RADIUS_Y : dy + tt.DISPLACE_RADIUS_Y + 1;

    this.displaceBy(dx, dy);
  }

  private displaceBy(dx: number, dy: number): void {
    if (this._isSnapped) {
      this._isSnapped = false;
      this._offset.x += dx;
      this._offset.y += dy;
    }
  }

  shouldDisplace(includeFullClasses: boolean): boolean {
    const isFull: boolean = !!this.session.stream.full;
    return isFull && !includeFullClasses && this.isSnapped;
  }

  get touched(): boolean {
    return this._touched;
  }

  touch(): void {
    this._touched = true;
  }
}

export default SessionPlacement;

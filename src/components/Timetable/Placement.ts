import { LinkedSession, getDuration } from '../../state';
import * as SessionPosition from './SessionPosition';
import { Dimensions, Placement, TimetablePosition } from './timetableTypes';
import {
  getCellHeight,
  TIMETABLE_FIRST_CELL_WIDTH,
  TIMETABLE_BORDER_WIDTH,
  getCellWidth,
} from './timetableUtil';

export abstract class TimetablePlacement {
  private _session: LinkedSession;
  protected _offset: TimetablePosition;
  protected _isSnapped: boolean = true;
  protected _isDragging: boolean = false;
  protected _isRaised: boolean = false;
  private _basePlacement_cachedDeps: (Dimensions | number | boolean)[] = [];
  private _basePlacement_cachedResult: Placement | undefined;
  private _getPosition_cachedDeps: (Dimensions | number | boolean)[] = [];
  private _getPosition_cachedResult: Required<Placement> | undefined;
  protected clashDepthMultiplier = 1;
  clashDepth: number = 0;

  constructor(session: LinkedSession) {
    this._session = session;
    this._offset = { x: 0, y: 0 };
  }

  get session(): LinkedSession {
    return this._session;
  }

  get id(): string {
    return `${this._session.day}~${this._session.start}~${this._session.end}`;
  }

  get duration(): number {
    return getDuration(this._session);
  }

  get isSnapped(): boolean {
    return this._isSnapped && !this._isRaised;
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  get isRaised(): boolean {
    return this._isRaised;
  }

  basePlacement(
    timetableDimensions: Dimensions,
    firstHour: number,
    compact: boolean,
    showMode: boolean,
  ): Placement {
    const dependencies = [
      timetableDimensions,
      firstHour,
      compact,
      this.session.start,
      this.dayIndex,
    ];
    if (dependencies.every((dep, i) => this._basePlacement_cachedDeps[i] === dep)) {
      if (this._basePlacement_cachedResult !== undefined) {
        return this._basePlacement_cachedResult;
      }
    }

    const { width, height } = this.baseDimensions(timetableDimensions, compact, showMode);

    const hourIndex = this._session.start - firstHour;

    const sessionWidth = getCellWidth(timetableDimensions.width);

    const baseX = TIMETABLE_FIRST_CELL_WIDTH + TIMETABLE_BORDER_WIDTH;
    const baseY = getCellHeight(true, false) + TIMETABLE_BORDER_WIDTH;
    const dayOffsetX = sessionWidth * this.dayIndex;
    const hourOffsetY = getCellHeight(compact, showMode) * hourIndex;

    const x = baseX + dayOffsetX;
    const y = baseY + hourOffsetY;

    this._basePlacement_cachedDeps = dependencies;
    this._basePlacement_cachedResult = { x, y, width, height };
    return this._basePlacement_cachedResult;
  }

  getPosition(
    timetableDimensions: Dimensions,
    startHour: number,
    compact: boolean,
    showMode: boolean,
  ): Required<Placement> {
    const base = this.basePlacement(timetableDimensions, startHour, compact, showMode);
    const dependencies = [
      timetableDimensions,
      startHour,
      base,
      this.clashDepth,
      this.isRaised,
      this.isSnapped,
      this._offset.x,
      this._offset.y,
    ];
    if (dependencies.every((dep, i) => this._getPosition_cachedDeps[i] === dep)) {
      if (this._getPosition_cachedResult) {
        return this._getPosition_cachedResult;
      }
    }

    const { width, height } = base;
    const clash = SessionPosition.getClashOffset(this.clashDepth * this.clashDepthMultiplier);
    const raised = SessionPosition.getRaisedOffset(this.isRaised);
    let x = base.x + clash.x + raised.x + this._offset.x;
    let y = base.y + clash.y + raised.y + this._offset.y;
    const z = SessionPosition.getZ(this.isSnapped, this.isDragging, this.clashDepth);

    const maxX = timetableDimensions.width - base.width;
    const maxY = timetableDimensions.height - base.height;

    x = Math.min(Math.max(x, TIMETABLE_BORDER_WIDTH), maxX);
    y = Math.min(Math.max(y, TIMETABLE_BORDER_WIDTH), maxY);

    this._getPosition_cachedDeps = dependencies;
    this._getPosition_cachedResult = { x, y, z, width, height };
    return this._getPosition_cachedResult;
  }

  private baseDimensions(
    timetableDimensions: Dimensions,
    compact: boolean,
    showMode: boolean,
  ): Dimensions {
    const sessionWidth = getCellWidth(timetableDimensions.width);
    const sessionHeight = this.calculateHeight(compact, showMode);
    const width = sessionWidth - TIMETABLE_BORDER_WIDTH;
    const height = sessionHeight - TIMETABLE_BORDER_WIDTH;
    return { width, height };
  }

  get dayIndex(): number {
    return ['M', 'T', 'W', 'H', 'F'].indexOf(this._session.day);
  }

  private calculateHeight(compact: boolean, showMode: boolean): number {
    return this.duration * getCellHeight(compact, showMode);
  }
}

export default TimetablePlacement;

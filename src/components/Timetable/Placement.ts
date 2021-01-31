import { LinkedSession, getDuration } from '../../state';
import { Dimensions, Placement } from './timetableTypes';
import {
  getCellHeight,
  TIMETABLE_FIRST_CELL_WIDTH,
  TIMETABLE_DAYS,
  TIMETABLE_BORDER_WIDTH,
} from './timetableUtil';

export abstract class TimetablePlacement {
  private _session: LinkedSession;

  constructor(session: LinkedSession) {
    this._session = session;
  }

  get session(): LinkedSession {
    return this._session;
  }

  get id(): string {
    return `${this._session.day}~${this._session.start}`;
  }

  get duration(): number {
    return getDuration(this._session);
  }

  basePlacement = (() => {
    let cachedDeps: (Dimensions | number | boolean)[] = [];
    let cachedResult: Placement;

    return (
      timetableDimensions: Dimensions,
      firstHour: number,
      compact: boolean,
      showMode: boolean,
    ): Placement => {
      const dependencies = [
        timetableDimensions,
        firstHour,
        compact,
        this.session.start,
        this.dayIndex,
      ];
      if (dependencies.every((dep, i) => cachedDeps[i] === dep)) {
        return cachedResult;
      }

      const { width, height } = this.baseDimensions(timetableDimensions, compact, showMode);

      const hourIndex = this._session.start - firstHour;

      const sessionWidth = this.calculateWidth(timetableDimensions.width);

      const baseX = TIMETABLE_FIRST_CELL_WIDTH + TIMETABLE_BORDER_WIDTH;
      const baseY = getCellHeight(true, false) + TIMETABLE_BORDER_WIDTH;
      const dayOffsetX = sessionWidth * this.dayIndex;
      const hourOffsetY = getCellHeight(compact, showMode) * hourIndex;

      const x = baseX + dayOffsetX;
      const y = baseY + hourOffsetY;

      cachedDeps = dependencies;
      cachedResult = { x, y, width, height };
      return cachedResult;
    };
  })();

  private baseDimensions(
    timetableDimensions: Dimensions,
    compact: boolean,
    showMode: boolean,
  ): Dimensions {
    const sessionWidth = this.calculateWidth(timetableDimensions.width);
    const sessionHeight = this.calculateHeight(compact, showMode);
    const width = sessionWidth - TIMETABLE_BORDER_WIDTH;
    const height = sessionHeight - TIMETABLE_BORDER_WIDTH;
    return { width, height };
  }

  private get dayIndex(): number {
    return ['M', 'T', 'W', 'H', 'F'].indexOf(this._session.day);
  }

  private calculateWidth(timetableWidth: number): number {
    return (timetableWidth - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;
  }

  private calculateHeight(compact: boolean, showMode: boolean): number {
    return this.duration * getCellHeight(compact, showMode);
  }
}

export default TimetablePlacement;

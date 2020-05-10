import { LinkedSession } from '../../state';
import { Dimensions, Placement } from './timetableTypes';
import { TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_CELL_HEIGHT, TIMETABLE_DAYS, TIMETABLE_BORDER_WIDTH } from './timetableUtil';

export abstract class TimetablePlacement {
  private _session: LinkedSession;

  constructor (session: LinkedSession) {
    this._session = session;
  }

  get session (): LinkedSession {
    return this._session;
  }

  basePlacement = (() => {
    let cachedDeps: (Dimensions | number)[] = [];
    let cachedResult: Placement;

    return (timetableDimensions: Dimensions, firstHour: number): Placement => {
      const dependencies = [
        timetableDimensions,
        firstHour,
        this.session.start,
        this.dayIndex,
      ];
      if (dependencies.every((dep, i) => cachedDeps[i] === dep)) {
        return cachedResult;
      }

      const { width, height } = this.baseDimensions(timetableDimensions);

      const hourIndex = this._session.start - firstHour;

      const sessionWidth = this.calculateWidth(timetableDimensions.width);

      const baseX = TIMETABLE_FIRST_CELL_WIDTH + TIMETABLE_BORDER_WIDTH;
      const baseY = TIMETABLE_CELL_HEIGHT + TIMETABLE_BORDER_WIDTH;
      const dayOffsetX = sessionWidth * this.dayIndex;
      const hourOffsetY = TIMETABLE_CELL_HEIGHT * hourIndex;

      const x = baseX + dayOffsetX;
      const y = baseY + hourOffsetY;

      cachedDeps = dependencies;
      cachedResult = { x, y, width, height };
      return cachedResult;
    }
  })();

  baseDimensions (timetableDimensions: Dimensions): Dimensions {
    const sessionWidth = this.calculateWidth(timetableDimensions.width);
    const sessionHeight = this.calculateHeight();
    const width = sessionWidth - TIMETABLE_BORDER_WIDTH;
    const height = sessionHeight - TIMETABLE_BORDER_WIDTH;
    return { width, height };
  }

  private get dayIndex (): number {
    return ['M', 'T', 'W', 'H', 'F'].indexOf(this._session.day);
  }

  private calculateWidth (timetableWidth: number): number {
    return (timetableWidth - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;
  }

  private calculateHeight (): number {
    return (this._session.end - this._session.start) * TIMETABLE_CELL_HEIGHT;
  }
}

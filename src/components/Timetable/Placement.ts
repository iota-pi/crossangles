import { LinkedSession } from "../../state/Session";
import { Dimensions, Placement } from "./timetableTypes";
import { TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_CELL_HEIGHT, TIMETABLE_DAYS, TIMETABLE_BORDER_WIDTH } from "./timetableUtil";

export abstract class TimetablePlacement {
  private _session: LinkedSession;

  constructor (session: LinkedSession) {
    this._session = session;
  }

  get session (): LinkedSession {
    return this._session;
  }

  basePlacement (timetableDimensions: Dimensions, startHour: number): Placement {
    const dayIndex = this.dayOfWeek;
    const hourIndex = this._session.start - startHour;

    const sessionWidth = this.calculateWidth(timetableDimensions.width);
    const sessionHeight = this.calculateHeight();

    const baseX = TIMETABLE_FIRST_CELL_WIDTH + TIMETABLE_BORDER_WIDTH;
    const baseY = TIMETABLE_CELL_HEIGHT + TIMETABLE_BORDER_WIDTH;
    const dayOffsetX = sessionWidth * dayIndex;
    const hourOffsetY = TIMETABLE_CELL_HEIGHT * hourIndex;

    const x = baseX + dayOffsetX;
    const y = baseY + hourOffsetY;

    const width = sessionWidth - TIMETABLE_BORDER_WIDTH;
    const height = sessionHeight - TIMETABLE_BORDER_WIDTH;

    return { x, y, width, height };
  }

  private get dayOfWeek (): number {
    return ['M', 'T', 'W', 'H', 'F'].indexOf(this._session.day);
  }

  private calculateWidth (timetableWidth: number): number {
    return (timetableWidth - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;
  }

  private calculateHeight (): number {
    return (this._session.end - this._session.start) * TIMETABLE_CELL_HEIGHT;
  }
}

import { Session } from "../../state";
import { Dimensions, Placement } from "./timetableTypes";
import { TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_CELL_HEIGHT, TIMETABLE_DAYS, TIMETABLE_BORDER_WIDTH } from "./timetableUtil";
import { DimensionManager } from "./DimensionManager";

export interface ITimetablePlacement {
  session: Session,
  dimensions: DimensionManager,
}

export abstract class TimetablePlacement {
  private _session: Session;
  private _dimensions: DimensionManager;

  constructor (data: ITimetablePlacement) {
    this._session = data.session;
    this._dimensions = data.dimensions;
  }

  get session (): Session {
    return this._session;
  }

  get basePlacement (): Placement {
    const dayIndex = this.dayOfWeek;
    const hourIndex = this._session.start - this._dimensions.startHour;

    const sessionWidth = this.calculateWidth(this._dimensions.dimensions.width);
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

  protected get dimensions (): Dimensions {
    return this._dimensions.dimensions;
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

  clone () {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

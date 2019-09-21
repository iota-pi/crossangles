import { Dimensions } from "./timetableTypes";

export interface IHourSpan {
  start: number,
  end: number,
}

export class DimensionManager {
  private _dimensions: Dimensions;
  private _hours: IHourSpan;

  constructor () {
    this._dimensions = { width: 0, height: 0 };
    this._hours = { start: 0, end: 24 };
  }

  get startHour () {
    return this._hours.start;
  }

  get endHour () {
    return this._hours.end;
  }

  get dimensions () {
    return Object.assign({}, this._dimensions);
  }

  updateDimensions (newDimensions: Dimensions) {
    this._dimensions = newDimensions;
  }

  updateHours (newHours: IHourSpan) {
    this._hours = newHours;
  }

  clone (): DimensionManager {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

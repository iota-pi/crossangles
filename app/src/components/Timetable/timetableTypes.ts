export interface Dimensions {
  width: number,
  height: number,
}

export interface TimetablePosition {
  x: number,
  y: number,
  z?: number,
}

export type Placement = Dimensions & TimetablePosition;

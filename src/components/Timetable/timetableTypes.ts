
export interface Dimensions {
  width: number,
  height: number,
}

export interface Position {
  x: number,
  y: number,
}

export type Placement = Dimensions & Position;

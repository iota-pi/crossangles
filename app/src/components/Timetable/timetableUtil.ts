export const DROPZONE_Z = 100;
export const SESSION_BASE_Z = 10;
export const SESSION_DRAG_Z = DROPZONE_Z;
export const SESSION_LIFT_Z = 1;

export const CLASH_OFFSET_X = -7;
export const CLASH_OFFSET_Y = -5;

export const TIMETABLE_DAYS = 5;
export const TIMETABLE_FIRST_CELL_WIDTH = 62;
export const TIMETABLE_CELL_HEIGHT = 50;
export const TIMETABLE_BORDER_WIDTH = 1;
export const TIMETABLE_CELL_MIN_WIDTH = 150;
export const SNAP_DIST = 40;

export const DISPLACE_VARIATION_X = 15;
export const DISPLACE_VARIATION_Y = 10;
export const DISPLACE_RADIUS_X = 15;
export const DISPLACE_RADIUS_Y = 10;

export const RAISE_DIST_X = -5;
export const RAISE_DIST_Y = -5;


export function arraysEqual<T> (a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

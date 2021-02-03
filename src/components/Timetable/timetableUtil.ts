export const DROPZONE_Z = 100;
export const SESSION_BASE_Z = 10;
export const SESSION_DRAG_Z = DROPZONE_Z;
export const SESSION_LIFT_Z = 1;

export const CLASH_OFFSET_X = -7;
export const CLASH_OFFSET_Y = -5;

export const TIMETABLE_DAYS = 5;
export const TIMETABLE_FIRST_CELL_WIDTH = 62;
const TIMETABLE_COMPACT_CELL_HEIGHT = 50;
const TIMETABLE_CELL_HEIGHT = 60;
const TIMETABLE_CELL_SHOW_MODE_HEIGHT = 80;
export const TIMETABLE_BORDER_WIDTH = 1;
export const TIMETABLE_CELL_MIN_WIDTH = 150;

export const DISPLACE_VARIATION_X = 15;
export const DISPLACE_VARIATION_Y = 10;
export const DISPLACE_RADIUS_X = 15;
export const DISPLACE_RADIUS_Y = 10;

export const RAISE_DIST_X = -5;
export const RAISE_DIST_Y = -5;


export function arraysEqual<T>(a: T[], b: T[]): boolean {
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

export function getCellHeight(compact: boolean, showMode: boolean) {
  if (showMode) {
    return TIMETABLE_CELL_SHOW_MODE_HEIGHT;
  }
  return compact ? TIMETABLE_COMPACT_CELL_HEIGHT : TIMETABLE_CELL_HEIGHT;
}

export function getSnapDistance(cellHeight: number) {
  return cellHeight + Math.sqrt(cellHeight);
}

export function getTimetableHeight(duration: number, compact: boolean, showMode: boolean) {
  const headerRowHeight = getCellHeight(true, false);
  const mainRowsHeight = getCellHeight(compact, showMode) * duration;
  return headerRowHeight + mainRowsHeight;
}

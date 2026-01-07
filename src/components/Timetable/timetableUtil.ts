import { Placement } from './timetableTypes';

export const DROPZONE_Z = 100;
export const SESSION_BASE_Z = 10;
export const SESSION_DRAG_Z = DROPZONE_Z;
export const SESSION_LIFT_Z = 1;

export const CLASH_OFFSET_X = -9;
export const CLASH_OFFSET_Y = -7;

export const TIMETABLE_DAYS = 5;
export const TIMETABLE_FIRST_CELL_WIDTH = 62;
const TIMETABLE_COMPACT_CELL_HEIGHT = 50;
const TIMETABLE_CELL_HEIGHT = 60;
const TIMETABLE_CELL_SHOW_MODE_HEIGHT = 80;
export const TIMETABLE_BORDER_WIDTH = 1;
export const TIMETABLE_CELL_MIN_WIDTH = 100;

export const DISPLACE_VARIATION_X = 15;
export const DISPLACE_VARIATION_Y = 10;
export const DISPLACE_RADIUS_X = 15;
export const DISPLACE_RADIUS_Y = 10;

export const RAISE_DIST_X = -5;
export const RAISE_DIST_Y = -5;

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 7;

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

export function getCellWidth(timetableWidth: number,  numDaysActive: number): number {
  return (timetableWidth - TIMETABLE_FIRST_CELL_WIDTH) / numDaysActive;
}

export function getCellHeight(compact: boolean, showMode: boolean) {
  if (showMode) {
    return TIMETABLE_CELL_SHOW_MODE_HEIGHT;
  }
  return compact ? TIMETABLE_COMPACT_CELL_HEIGHT : TIMETABLE_CELL_HEIGHT;
}

export function getSnapDistance(sessionHeight: number) {
  return 30 + 1.15 * sessionHeight;
}

export function getOverlapArea(p1: Placement, p2: Placement) {
  const left = Math.max(p1.x, p2.x);
  const right = Math.min(p1.x + p1.width, p2.x + p2.width);
  const overlapX = Math.max(right - left, 0);

  const top = Math.max(p1.y, p2.y);
  const bottom = Math.min(p1.y + p1.height, p2.y + p2.height);
  const overlapY = Math.max(bottom - top, 0);
  return overlapX * overlapY;
}

export function getTimetableHeight(duration: number, compact: boolean, showMode: boolean) {
  const headerRowHeight = getCellHeight(true, false);
  const mainRowsHeight = getCellHeight(compact, showMode) * duration;
  return headerRowHeight + mainRowsHeight;
}

export function findFreeDepth(takenDepths: Set<number>): number {
  for (let j = 0; j < takenDepths.size; ++j) {
    if (!takenDepths.has(j)) {
      return j;
    }
  }

  return takenDepths.size;
}

export function getCustomCode() {
  return `custom_${Math.random()}`;
}

// From Monday, find number of days to display on the grid
// input: [ 'A~B~[day][time]~C', ...]
export function getNumDisplayDays(occurrences: string[] | null): number {
  if (occurrences === null || occurrences.length === 0) return FRIDAY;
  const scheduleParts = occurrences.map(item => item.split('~')[2] || '');

  if (scheduleParts.some(part => part.includes('s'))) return SUNDAY;
  if (scheduleParts.some(part => part.includes('S'))) return SATURDAY;

  return FRIDAY;
}

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

export function getCellWidth(timetableWidth: number): number {
  return (timetableWidth - TIMETABLE_FIRST_CELL_WIDTH) / TIMETABLE_DAYS;
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

// helper for findDaysToDisplay 
// takes array and splits it to day letters
function turnOccurenceToDays(schedule: string[]): Set<string> {
  const letters = schedule.flatMap(item => {
      const occurrences = item.split('~')[2] || "";
      
      // 2. Match all standard day letters (M, T, W, H, F, S, s)
      // This finds every instance of these specific characters
      const matches = occurrences.match(/[MTWHFSs]/g);
      
      return matches || [];
    });

    return new Set(letters);
}

export function findDaysToDisplay(occurrences: string[] | null): number {
  if (occurrences === null) return 5;
  const days = turnOccurenceToDays(occurrences);

  console.log(days)

  if (days.has('s')) return 7;
  if (days.has('S')) return 6;
  return 5;
}

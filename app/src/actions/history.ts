import { UserAction } from ".";

export const UNDO = 'UNDO';
export const REDO = 'REDO';
export interface HistoryAction extends UserAction {
  type: typeof UNDO | typeof REDO,
}

export function undoTimetable () {
  return { type: UNDO, isUser: true };
}

export function redoTimetable () {
  return { type: REDO, isUser: true };
}

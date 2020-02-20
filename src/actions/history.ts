import { Action } from 'redux';

export const UNDO = 'UNDO';
export const REDO = 'REDO';
export interface HistoryAction extends Action {
  type: typeof UNDO | typeof REDO,
}

export function undoTimetable () {
  return { type: UNDO };
}

export function redoTimetable () {
  return { type: REDO };
}

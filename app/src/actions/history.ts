import { event } from 'react-ga';
import { Action } from 'redux';
import { CATEGORY } from '../analytics';

export const UNDO = 'UNDO';
export const REDO = 'REDO';
export interface HistoryAction extends Action {
  type: typeof UNDO | typeof REDO,
}

export function undoTimetable() {
  event({
    category: CATEGORY,
    action: 'History: Undo',
  });

  return { type: UNDO };
}

export function redoTimetable() {
  event({
    category: CATEGORY,
    action: 'History: Redo',
  });

  return { type: REDO };
}

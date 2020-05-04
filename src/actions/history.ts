import { Action } from 'redux';
import { CATEGORY_TIMETABLE } from '../analytics';
import ReactGA from 'react-ga';

export const UNDO = 'UNDO';
export const REDO = 'REDO';
export interface HistoryAction extends Action {
  type: typeof UNDO | typeof REDO,
}

export function undoTimetable () {
  ReactGA.event({
    category: CATEGORY_TIMETABLE,
    action: 'history',
    label: 'undo',
  });

  return { type: UNDO };
}

export function redoTimetable () {
  ReactGA.event({
    category: CATEGORY_TIMETABLE,
    action: 'history',
    label: 'redo',
  });

  return { type: REDO };
}

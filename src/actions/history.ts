import ReactGA from 'react-ga';
import { Action } from 'redux';
import { CATEGORY } from '../analytics';

export const UNDO = 'UNDO';
export const REDO = 'REDO';
export interface HistoryAction extends Action {
  type: typeof UNDO | typeof REDO,
}

export function undoTimetable () {
  ReactGA.event({
    category: CATEGORY,
    action: 'History: Undo',
  });

  return { type: UNDO };
}

export function redoTimetable () {
  ReactGA.event({
    category: CATEGORY,
    action: 'History: Redo',
  });

  return { type: REDO };
}

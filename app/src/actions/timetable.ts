import { Action } from 'redux';
import { YearAndTerm, getCurrentTerm } from '../state';
import { SessionManagerData } from '../components/Timetable/SessionManagerTypes';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';

export interface SessionManagerAction extends Action {
  type: typeof UPDATE_SESSION_MANAGER,
  sessionManager: SessionManagerData,
  term: string,
}


export const UPDATE_SUGGESTED_TIMETABLE = 'UPDATE_SUGGESTED_TIMETABLE';

export interface SuggestionAction extends Action {
  type: typeof UPDATE_SUGGESTED_TIMETABLE,
  score: number | null,
}


export const UPDATE_UNPLACED_COUNT = 'UPDATE_UNPLACED_COUNT';

export interface UnplacedCountAction extends Action {
  type: typeof UPDATE_UNPLACED_COUNT,
  count: number,
}


export function setTimetable(
  newTimetable: SessionManagerData,
  meta: YearAndTerm,
): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
    term: getCurrentTerm(meta),
  };
}

export function setSuggestionScore(score: number | null): SuggestionAction {
  return {
    type: UPDATE_SUGGESTED_TIMETABLE,
    score,
  };
}

export function setUnplacedCount(count: number): UnplacedCountAction {
  return {
    type: UPDATE_UNPLACED_COUNT,
    count,
  };
}

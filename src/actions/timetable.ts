import { SessionManagerData } from '../components/Timetable/SessionManager';
import { Action } from 'redux';
import { YearAndTerm, getCurrentTerm } from '../state/Meta';

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


export function setTimetable (newTimetable: SessionManagerData, meta: YearAndTerm): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
    term: getCurrentTerm(meta),
  }
}

export function setSuggestionScore (score: number | null): SuggestionAction {
  return {
    type: UPDATE_SUGGESTED_TIMETABLE,
    score,
  }
}

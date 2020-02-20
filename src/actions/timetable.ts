import { SessionManagerData } from '../components/Timetable/SessionManager';
import { Action } from 'redux';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';
export interface SessionManagerAction extends Action {
  type: typeof UPDATE_SESSION_MANAGER,
  sessionManager: SessionManagerData,
}

export const UPDATE_SUGGESTED_TIMETABLE = 'UPDATE_SUGGESTED_TIMETABLE';
export interface SuggestionAction extends Action {
  type: typeof UPDATE_SUGGESTED_TIMETABLE,
  score: number | null,
}


export function setTimetable (newTimetable: SessionManagerData): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
  }
}

export function setSuggestionScore (score: number | null): SuggestionAction {
  return {
    type: UPDATE_SUGGESTED_TIMETABLE,
    score,
  }
}

import { UPDATE_SESSION_MANAGER, UPDATE_SUGGESTED_TIMETABLE, AllActions } from '../actions';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { baseState } from '../state';

export function timetable (
  state: SessionManagerData | undefined,
  action: AllActions
): SessionManagerData {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state || baseState.timetable;
};

export function suggestionScore (
  state: number | null | undefined,
  action: AllActions,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state || baseState.suggestionScore;
}

import { UPDATE_SESSION_MANAGER, UPDATE_SUGGESTED_TIMETABLE, AllActions } from '../actions';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { baseState } from '../state';

export function timetable (
  state: SessionManagerData = baseState.timetable,
  action: AllActions,
): SessionManagerData {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state;
};

export function suggestionScore (
  state: number | null = baseState.suggestionScore,
  action: AllActions,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state;
}

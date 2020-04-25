import { UPDATE_SESSION_MANAGER, UPDATE_SUGGESTED_TIMETABLE, AllActions } from '../actions';
import { initialState } from '../state';
import { Timetables } from '../state/Timetable';

export function timetables (
  state: Timetables = initialState.timetables,
  action: AllActions,
): Timetables {
  if (action.type === UPDATE_SESSION_MANAGER) {
    const term = action.term;
    if (state[term] !== action.sessionManager) {
      state = { ...state, [term]: action.sessionManager };
    }
    return state;
  }

  return state;
};

export function suggestionScore (
  state: number | null = initialState.suggestionScore,
  action: AllActions,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state;
}

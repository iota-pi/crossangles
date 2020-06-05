import { UPDATE_SESSION_MANAGER, UPDATE_SUGGESTED_TIMETABLE, AllActions, UPDATE_UNPLACED_COUNT } from '../actions';
import { initialState, Timetables } from '../state';

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
  state: number | null | undefined = initialState.suggestionScore,
  action: AllActions,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state;
}

export function unplacedCount (
  state: number | undefined = initialState.unplacedCount,
  action: AllActions,
): number {
  if (action.type === UPDATE_UNPLACED_COUNT) {
    return action.count;
  }

  return state;
}

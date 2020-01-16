import { UPDATE_SESSION_MANAGER, SessionManagerAction, OtherAction, UPDATE_SUGGESTED_TIMETABLE, SuggestionAction } from '../actions';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { baseState } from '../state';

export function timetable (
  state: SessionManagerData | undefined,
  action: SessionManagerAction | OtherAction
): SessionManagerData {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state || baseState.timetable;
};

export function suggestionScore (
  state: number | null | undefined,
  action: SuggestionAction | OtherAction,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state || baseState.suggestionScore;
}

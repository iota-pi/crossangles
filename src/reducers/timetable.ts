import { UPDATE_SESSION_MANAGER, SessionManagerAction, OtherAction } from '../actions';
import { SessionManager, SessionManagerData } from '../components/Timetable/SessionManager';

export function timetable (
  state: SessionManagerData | undefined,
  action: SessionManagerAction | OtherAction
): SessionManagerData {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state || new SessionManager().data;
};

export function history (
  state: SessionManagerData | undefined,
  action: SessionManagerAction | OtherAction
): SessionManagerData {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state || new SessionManager().data;
};

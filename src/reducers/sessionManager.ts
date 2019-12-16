import { UPDATE_SESSION_MANAGER, SessionManagerAction, OtherAction } from '../actions';
import { SessionManager, ILinkedSessionManager } from '../components/Timetable/SessionManager';

export function sessionManager (
  state: ILinkedSessionManager | undefined,
  action: SessionManagerAction | OtherAction
): ILinkedSessionManager {
  if (action.type === UPDATE_SESSION_MANAGER) {
    return action.sessionManager;
  }

  return state || new SessionManager().data;
};

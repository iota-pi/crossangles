import { UPDATE_TIMETABLE, TimetableAction } from '../actions';
import { SessionManager, ILinkedSessionManager } from '../components/Timetable/SessionManager';

export function sessionManager (
  state: ILinkedSessionManager | undefined,
  action: TimetableAction
): ILinkedSessionManager {
  switch (action.type) {
    case UPDATE_TIMETABLE:
      return action.timetable;
  }

  return state || new SessionManager().data;
};

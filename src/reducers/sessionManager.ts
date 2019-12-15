import { UPDATE_TIMETABLE, TimetableAction, OtherAction } from '../actions';
import { SessionManager, ILinkedSessionManager } from '../components/Timetable/SessionManager';

export function sessionManager (
  state: ILinkedSessionManager | undefined,
  action: TimetableAction | OtherAction
): ILinkedSessionManager {
  switch (action.type) {
    case UPDATE_TIMETABLE:
      return action.timetable;
  }

  return state || new SessionManager().data;
};

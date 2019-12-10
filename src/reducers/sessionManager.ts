import { UPDATE_TIMETABLE, TimetableAction } from '../actions';
import { SessionManager } from '../components/Timetable/SessionManager';

export function sessionManager (
  state: SessionManager | undefined,
  action: TimetableAction
): SessionManager {
  switch (action.type) {
    case UPDATE_TIMETABLE:
      return action.timetable;
  }

  return state || new SessionManager();
};

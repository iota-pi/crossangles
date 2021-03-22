import { UPDATE_SESSION_MANAGER, UPDATE_SUGGESTED_TIMETABLE, AllActions, UPDATE_UNPLACED_COUNT, SET_COURSE_DATA } from '../actions';
import { initialState, Timetables, getCurrentTerm, SessionId, getCourseId, getStreamId } from '../state';
import { SessionManagerData } from '../components/Timetable/SessionManager';

export function timetables(
  state: Timetables = initialState.timetables,
  action: AllActions,
): Timetables {
  if (action.type === UPDATE_SESSION_MANAGER) {
    const term = action.term;
    if (state[term] !== action.sessionManager) {
      return { ...state, [term]: action.sessionManager };
    }
    return state;
  }

  if (action.type === SET_COURSE_DATA) {
    const courses = new Map(action.courses.map(c => [getCourseId(c), c]));
    const term = getCurrentTerm(action.meta);
    const timetable: SessionManagerData | undefined = state[term];
    if (!timetable) {
      return state;
    }
    const sessionsToRemove = new Set<SessionId>();
    for (const [sessionId, placement] of timetable.map) {
      const course = courses.get(placement.session.course);
      if (course === undefined) {
        sessionsToRemove.add(sessionId);
      } else {
        const streamExists = course.streams.find(
          s => getStreamId(course, s) === placement.session.stream
        );
        if (streamExists === undefined) {
          sessionsToRemove.add(sessionId);
        }
      }
    }
    const newTimetable = { ...timetable };
    newTimetable.map = newTimetable.map.filter(([id, _]) => !sessionsToRemove.has(id));
    newTimetable.order = newTimetable.order.filter(id => !sessionsToRemove.has(id));
    newTimetable.renderOrder = newTimetable.renderOrder.filter(id => !sessionsToRemove.has(id));
    return { ...state, [term]: newTimetable };
  }

  return state;
}

export function suggestionScore(
  state: number | null | undefined = initialState.suggestionScore,
  action: AllActions,
): number | null {
  if (action.type === UPDATE_SUGGESTED_TIMETABLE) {
    return action.score;
  }

  return state;
}

export function unplacedCount(
  state: number | undefined = initialState.unplacedCount,
  action: AllActions,
): number {
  if (action.type === UPDATE_UNPLACED_COUNT) {
    return action.count;
  }

  return state;
}

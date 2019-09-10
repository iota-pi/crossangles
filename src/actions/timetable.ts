import { Timetable, Course, CBSEvent, Options, Stream } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';

export const UPDATE_TIMETABLE = 'UPDATE_TIMETABLE';
export interface TimetableAction extends Action {
  type: typeof UPDATE_TIMETABLE;
  timetable: Timetable;
}

export interface UpdateTimetableConfig {
  previousTimetable: Timetable;
  courses: Course[];
  events: CBSEvent[];
  options: Options;
}

export interface TimetableSearchResult {
  success: boolean,
  timetable: Timetable,
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    previousTimetable,
    courses,
    events,
    options: {
      includeFull,
    },
  } = config;

  // Group streams by course and component
  let components = coursesToComponents(courses, events, includeFull);

  // Check for impossible timetables
  let success = true;
  if (components.filter(c => c.streams.length === 0).length > 0) {
    components = components.filter(c => c.streams.length > 0);
    success = false;
  }

  try {
    const newTimetable = search(components, previousTimetable);

    // Snap all repositioned sessions
    for (let s1 of newTimetable) {
      for (let s2 of previousTimetable) {
        if (s1.component === s2.component && s1.course === s2.course && s1.index === s2.index) {
          s1.snapToggle = !s2.snapToggle;
          break;
        }
      }
    }

    // Merge with previous timetable to keep displaced sessions
    if (!success) {
      const componentIds = newTimetable.map(s => `${s.course}-${s.component}`)
      const courseIds = courses.map(c => c.id);

      for (let session of previousTimetable) {
        // Copy old sessions only if:
        // 1. Session belongs to a course which still included
        // 2. This session's component is missing from the course
        if (courseIds.includes(session.course)) {
          if (!componentIds.includes(`${session.course}-${session.component}`)) {
            newTimetable.push(session);
          }
        }
      }
    }

    return {
      timetable: newTimetable,
      success,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function updateTimetable (newTimetable: Timetable): TimetableAction {
  return {
    type: UPDATE_TIMETABLE,
    timetable: newTimetable,
  }
}

export function swapStreams (timetable: Timetable, oldStream: Stream, newStream: Stream, topSessionIndex: number): TimetableAction {
  timetable = timetable.filter(s => s.stream !== oldStream.id);
  timetable = timetable.concat(newStream.sessions.filter(s => s.index !== topSessionIndex));
  timetable.push(newStream.sessions[topSessionIndex]);

  return {
    type: UPDATE_TIMETABLE,
    timetable,
  }
}

export function bumpStream (timetable: Timetable, stream: Stream, topSessionIndex: number): TimetableAction {
  return swapStreams(timetable, stream, stream, topSessionIndex);
}

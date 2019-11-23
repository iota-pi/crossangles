import { Timetable, Course, CBSEvent, Options, LinkedTimetable, CourseId } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';

export const UPDATE_TIMETABLE = 'UPDATE_TIMETABLE';
export interface TimetableAction extends Action {
  type: typeof UPDATE_TIMETABLE;
  timetable: LinkedTimetable;
}

export const BUMP_TIMETABLE_VERSION = 'BUMP_TIMETABLE_VERSION';
export interface TimetableVersionAction extends Action {
  type: typeof BUMP_TIMETABLE_VERSION;
}

export interface UpdateTimetableConfig {
  previousTimetable: Timetable;
  courses: Course[],
  events: CBSEvent[],
  webStreams: Set<CourseId>,
  options: Options,
}

export interface TimetableSearchResult {
  success: boolean,
  timetable: LinkedTimetable,
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    previousTimetable,
    courses,
    events,
    webStreams,
    options: {
      includeFull,
    },
  } = config;

  // Group streams by course and component
  let components = coursesToComponents(courses, events, webStreams, includeFull);

  // Check for impossible timetables
  let success = true;
  if (components.filter(c => c.streams.length === 0).length > 0) {
    components = components.filter(c => c.streams.length > 0);
    success = false;
  }

  try {
    const previousSessionIds = previousTimetable.map(s => s.id);
    const newTimetable = search(components, previousSessionIds);

    // Merge with previous timetable to keep displaced sessions
    if (!success) {
      const componentIds = newTimetable.map(s => `${s.course}-${s.component}`)

      for (let session of previousTimetable) {
        // Copy old sessions only if:
        // 1. Session belongs to a course which still included
        // 2. This session's component is missing from the course
        if (courses.includes(session.course)) {
          if (!componentIds.includes(`${session.course.id}-${session.component}`)) {
            newTimetable.push(session.serialise());
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

export function updateTimetable (newTimetable: LinkedTimetable): TimetableAction {
  return {
    type: UPDATE_TIMETABLE,
    timetable: newTimetable,
  }
}

export function bumpTimetableVersion (): TimetableVersionAction {
  return {
    type: BUMP_TIMETABLE_VERSION,
  }
}

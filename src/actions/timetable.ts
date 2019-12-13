import { Course, CBSEvent, Options, LinkedTimetable, CourseId, ILinkedSession } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';
import { ILinkedSessionManager } from '../components/Timetable/SessionManager';

export const UPDATE_TIMETABLE = 'UPDATE_TIMETABLE';
export interface TimetableAction extends Action {
  type: typeof UPDATE_TIMETABLE;
  timetable: ILinkedSessionManager;
}

export const BUMP_TIMETABLE_VERSION = 'BUMP_TIMETABLE_VERSION';
export interface TimetableVersionAction extends Action {
  type: typeof BUMP_TIMETABLE_VERSION;
}

export interface UpdateTimetableConfig {
  fixedSessions: ILinkedSession[];
  courses: Course[],
  events: CBSEvent[],
  webStreams: Set<CourseId>,
  options: Options,
}

export interface TimetableSearchResult {
  unplaced: ILinkedSession[],
  timetable: LinkedTimetable,
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    fixedSessions,
    courses,
    events,
    webStreams,
    options: {
      includeFull,
    },
  } = config;

  // Group streams by course and component
  // NB: removes full streams
  let components = coursesToComponents(courses, events, webStreams, includeFull);

  // Check for impossible timetables
  components = components.filter(c => c.streams.length > 0);
  // let allPlaced = true;
  // if (components.filter(c => c.streams.length === 0).length > 0) {
    // allPlaced = false;
  // }

  try {
    // Search for a new timetable, scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered 'unplaced'
    const newTimetable = search(components, fixedSessions);

    // TODO:
    // Merge with previous timetable to keep displaced sessions
    // if (!allPlaced) {
    //   const componentIds = newTimetable.map(s => `${s.course}-${s.component}`)
    //   for (let session of previousTimetable) {
    //     // Copy old sessions only if:
    //     // 1. Session belongs to a course which still included
    //     // 2. This session's component is missing from the course
    //     if (courses.includes(session.course)) {
    //       if (!componentIds.includes(`${session.course.id}-${session.component}`)) {
    //         newTimetable.push(session.serialise());
    //       }
    //     }
    //   }
    // }

    // Add fixed sessions
    const timetable = fixedSessions.concat(newTimetable);

    // Add full sessions
    const unplaced = getFullSessions(courses);
    timetable.push(...unplaced);

    return { timetable, unplaced };
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getFullSessions (courses: Course[]) {
  const fullStreams: ILinkedSession[] = [];
  for (let course of courses) {
    fullStreams.push(...course.streams.filter(s => s.full).flatMap(s => s.sessions));
  }
  return fullStreams;
}

export function updateTimetable (newTimetable: ILinkedSessionManager): TimetableAction {
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

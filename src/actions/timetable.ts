import { CBSEvent } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { SessionData, LinkedSession } from '../state/Session';
import { CourseData, CourseId } from '../state/Course';
import { Options } from '../state/Options';
// import { getSessions } from '../state/Stream';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';
export interface SessionManagerAction extends Action {
  type: typeof UPDATE_SESSION_MANAGER;
  sessionManager: SessionManagerData;
}

export const BUMP_TIMETABLE_VERSION = 'BUMP_TIMETABLE_VERSION';
export interface TimetableVersionAction extends Action {
  type: typeof BUMP_TIMETABLE_VERSION;
}

export interface UpdateTimetableConfig {
  fixedSessions: LinkedSession[];
  courses: CourseData[],
  events: CBSEvent[],
  webStreams: CourseId[],
  options: Options,
}

export interface TimetableSearchResult {
  unplaced: SessionData[],
  timetable: LinkedSession[],
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    fixedSessions,
    courses,
    events,
    webStreams,
    options,
  } = config;

  // Group streams by course and component
  // NB: removes full streams
  let includeFull = options.includeFull || false;
  let components = coursesToComponents(courses, events, webStreams, includeFull);

  // Check for impossible timetables
  // const fullSessions = components.filter(c => c.streams.length === 0);
  components = components.filter(c => c.streams.length > 0);

  try {
    // Search for a new timetable, scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered 'unplaced'
    const newTimetable = search(components, fixedSessions);

    // Add fixed sessions
    const timetable = fixedSessions.concat(newTimetable);

    // Add full sessions
    // const unplaced = getFullSessions(courses);
    // timetable.push(...unplaced);

    return { timetable, unplaced: [] };
  } catch (err) {
    console.error(err);
    return null;
  }
}

// function getFullSessions (courses: CourseData[]) {
//   const fullSessions: SessionData[] = [];
//   for (let course of courses) {
//     const fullStreams = course.streams.filter(s => s.full);
//     if (fullStreams.length) {
//       fullSessions.push(...getSessions(course, fullStreams[0]));
//     }
//   }
//   return fullSessions;
// }

export function updateSessionManager (newTimetable: SessionManagerData): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
  }
}

export function bumpTimetableVersion (): TimetableVersionAction {
  return {
    type: BUMP_TIMETABLE_VERSION,
  }
}

import { CBSEvent } from '../state';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { SessionData, LinkedSession } from '../state/Session';
import { CourseData, CourseId } from '../state/Course';
import { Options } from '../state/Options';
import { UserAction } from '.';
// import { getSessions } from '../state/Stream';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';
export interface SessionManagerAction extends UserAction {
  type: typeof UPDATE_SESSION_MANAGER;
  sessionManager: SessionManagerData;
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
  let components = coursesToComponents(
    courses,
    events,
    webStreams,
    fixedSessions,
    includeFull,
  );

  // Check for impossible timetables
  // const fullSessions = components.filter(c => c.streams.length === 0);
  components = components.filter(c => c.streams.length > 0);

  try {
    // Search for a new timetable, scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered 'unplaced'
    const timetable = search(components, fixedSessions);

    // Add fixed sessions
    timetable.push(...fixedSessions);

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

export function updateTimetable (newTimetable: SessionManagerData): SessionManagerAction {
  return {
    type: UPDATE_SESSION_MANAGER,
    sessionManager: newTimetable,
    isUser: true,
  }
}

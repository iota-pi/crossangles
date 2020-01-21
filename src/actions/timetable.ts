import { CBSEvent } from '../state';
import { search, TimetableSearchResult } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { LinkedSession } from '../state/Session';
import { CourseData, CourseId } from '../state/Course';
import { Options } from '../state/Options';
import { UserAction } from '.';
import { GeneticSearchOptionalConfig } from '../timetable/GeneticSearch';
// import { getSessions } from '../state/Stream';

export const UPDATE_SESSION_MANAGER = 'UPDATE_SESSION_MANAGER';
export interface SessionManagerAction extends UserAction {
  type: typeof UPDATE_SESSION_MANAGER,
  sessionManager: SessionManagerData,
}

export const UPDATE_SUGGESTED_TIMETABLE = 'UPDATE_SUGGESTED_TIMETABLE';
export interface SuggestionAction extends UserAction {
  type: typeof UPDATE_SUGGESTED_TIMETABLE,
  score: number | null,
}

export interface UpdateTimetableConfig {
  fixedSessions: LinkedSession[];
  courses: CourseData[],
  events: CBSEvent[],
  webStreams: CourseId[],
  options: Options,
  maxSpawn?: number,
  searchConfig?: GeneticSearchOptionalConfig,
}


export function doTimetableSearch (config: UpdateTimetableConfig): TimetableSearchResult | null {
  const {
    fixedSessions,
    courses,
    events,
    webStreams,
    options,
    maxSpawn,
    searchConfig,
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
    const result = search(components, fixedSessions, maxSpawn, searchConfig);

    // Add fixed sessions
    result.timetable.push(...fixedSessions);

    // Add full sessions
    // const unplaced = getFullSessions(courses);
    // timetable.push(...unplaced);

    return { ...result, unplaced: [] };
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

export function setSuggestionScore (score: number): SuggestionAction {
  return {
    type: UPDATE_SUGGESTED_TIMETABLE,
    score,
    isUser: true,
  }
}

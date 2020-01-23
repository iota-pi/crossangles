import { AdditionalEvent } from '../state';
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
  events: AdditionalEvent[],
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

  // Remove fixed sessions from full streams
  let includeFull = options.includeFull || false;
  const fixed = fixedSessions.filter(s => includeFull || !s.stream.full);

  // Group streams by course and component
  // NB: removes full streams
  let components = coursesToComponents(
    courses,
    events,
    webStreams,
    fixed,
    includeFull,
  );

  // Check for impossible timetables
  // const fullSessions = components.filter(c => c.streams.length === 0);
  components = components.filter(c => c.streams.length > 0);

  let result: ReturnType<typeof search>;
  try {
    // Search for a new timetable
    // NB: scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered to be 'unplaced'
    result = search(components, fixed, maxSpawn, searchConfig);
  } catch (err) {
    console.error(err);
    return null;
  }

  // Add fixed sessions
  result.timetable.push(...fixed);

  // Add full sessions
  // const unplaced = getFullSessions(courses);
  // timetable.push(...unplaced);

  return { ...result, unplaced: [] };
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

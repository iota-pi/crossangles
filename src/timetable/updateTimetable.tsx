import React from 'react';

import { AdditionalEvent } from '../state';
import { search, TimetableSearchResult } from './timetableSearch';
import { coursesToComponents, Component } from './coursesToComponents';
import { LinkedSession } from '../state/Session';
import { CourseData, CourseId } from '../state/Course';
import { Options } from '../state/Options';
import { GeneticSearchOptionalConfig } from './GeneticSearch';
import { linkStream } from '../state/Stream';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import SessionManager from '../components/Timetable/SessionManager';
import { setNotice, setTimetable, setSuggestionScore, clearNotice, toggleOption } from '../actions';

import Button from '@material-ui/core/Button';

export interface UpdateTimetableArgs {
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  sessionManager: SessionManager,
  selection: Selection,
  searchConfig?: GeneticSearchOptionalConfig,
  cleanUpdate?: boolean,
}

export interface Selection {
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  webStreams: CourseId[],
  options: Options,
}

export interface TimetableSearchConfig {
  fixedSessions: LinkedSession[];
  courses: CourseData[],
  events: AdditionalEvent[],
  webStreams: CourseId[],
  options: Options,
  maxSpawn?: number,
  ignoreCache?: boolean,
  searchConfig?: GeneticSearchOptionalConfig,
}


export const updateTimetable = async (
  args: UpdateTimetableArgs,
) => {
  let { dispatch, sessionManager, selection, searchConfig, cleanUpdate } = args;
  const { chosen, custom, additional, events, webStreams, options } = selection;
  const courses = [ ...chosen, ...custom, ...additional ];
  let fixedSessions: LinkedSession[] = [];
  if (!cleanUpdate) {
    fixedSessions = sessionManager.getTouchedSessions(courses, events);
  }

  const newTimetable = doTimetableSearch({
    fixedSessions,
    courses,
    events,
    webStreams,
    options,
    searchConfig,
    ignoreCache: cleanUpdate,
  });

  if (newTimetable === null) {
    // Displace some classes and display a warning
    await dispatch(setNotice('There was a problem generating a timetable'));
  } else {
    sessionManager.update(newTimetable.timetable, fixedSessions, newTimetable.score);
    await dispatch(setTimetable(sessionManager.data));

    await notifyUnplaced(args, newTimetable.unplaced || []);

    if (fixedSessions.length > 0) {
      // Try to calculate a more optimal timetable
      recommendTimetable(dispatch, selection);
    } else {
      // Clear outdated recommendation
      await dispatch(setSuggestionScore(null));
    }
  }
}

const notifyUnplaced = async (
  args: UpdateTimetableArgs,
  unplaced: LinkedSession[],
) => {
  const { dispatch, selection } = args;
  const count = unplaced.length;
  if (count > 0) {
    const es = count !== 1 ? 'es' : '';
    const messages = [
      `${count} class${es} could not be placed anywhere.`,
      'Already enrolled? Try including full classes',
    ];
    const actions: React.ReactNode[] = [(
      <Button
        color="secondary"
        variant="text"
        key="go"
        onClick={async () => {
          dispatch(clearNotice());
          dispatch(toggleOption('includeFull'));

          const options = selection.options;
          const includeFull = options.includeFull;
          const newOptions: Options = { ...options, includeFull: !includeFull };
          const newSelection: Selection = { ...selection, options: newOptions };
          const newArgs: UpdateTimetableArgs = { ...args, selection: newSelection };
          await updateTimetable(newArgs);
        }}
      >
        Retry
      </Button>
    )];

    const message = messages.join('\n');
    await dispatch(setNotice(message, actions));
  }
}

export const recommendTimetable = async (
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  selection: Selection,
  maxSpawn = 1,
  searchConfig: GeneticSearchOptionalConfig = { maxTime: 100 },
) => {
  const { chosen, custom, additional, events, webStreams, options } = selection;
  const courses = [ ...chosen, ...custom, ...additional ];
  const newTimetable = doTimetableSearch({
    fixedSessions: [],
    courses,
    events,
    webStreams,
    options,
    maxSpawn,
    searchConfig,
  });

  if (newTimetable !== null) {
    await dispatch(setSuggestionScore(newTimetable.score));
  }
}

export function doTimetableSearch ({
  fixedSessions,
  courses,
  events,
  webStreams,
  options,
  maxSpawn,
  ignoreCache,
  searchConfig,
}: TimetableSearchConfig): TimetableSearchResult | null {
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
  const fullComponents = components.filter(c => c.streams.length === 0);
  components = components.filter(c => c.streams.length > 0);

  let result: ReturnType<typeof search>;
  try {
    // Search for a new timetable
    // NB: scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered to be 'unplaced'
    result = search(components, fixed, maxSpawn, ignoreCache, searchConfig);
  } catch (err) {
    console.error(err);
    return null;
  }

  // Add fixed sessions
  result.timetable.push(...fixed);

  // Add sessions from first stream of any completely full components
  const unplaced = getFullStreamSessions(fullComponents);

  return { ...result, unplaced };
}

function getFullStreamSessions (fullComponents: Component[]) {
  const fullSessions: LinkedSession[] = [];

  for (const component of fullComponents) {
    const course = component.course;
    const firstStream = course.streams[0];
    const linkedStream = linkStream(course, firstStream);
    fullSessions.push(...linkedStream.sessions);
  }

  return fullSessions;
}

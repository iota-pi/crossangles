import React from 'react';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { exception } from 'react-ga';
import Button from '@material-ui/core/Button';

import {
  clearNotice,
  setNotice,
  setSuggestionScore,
  setTimetable,
  setUnplacedCount,
  toggleOption,
} from '../actions';
import {
  AdditionalEvent,
  CourseData,
  CourseId,
  LinkedSession,
  linkStream,
  Meta,
  Options,
} from '../state';
import SessionManager from '../components/Timetable/SessionManager';
import { search, TimetableSearchResult } from './timetableSearch';
import { coursesToComponents, Component } from './coursesToComponents';
import { GeneticSearchOptionalConfig } from './GeneticSearch';
import { TimetableScoreConfig } from './scoreTimetable';


export interface UpdateTimetableArgs {
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  sessionManager: SessionManager,
  selection: TimetableSelection,
  searchConfig?: GeneticSearchOptionalConfig,
  cleanUpdate?: boolean,
  scoreConfig: TimetableScoreConfig,
}

export interface TimetableSelection {
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  webStreams: CourseId[],
  options: Options,
  meta: Meta,
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
  scoreConfig: TimetableScoreConfig,
}


export async function updateTimetable(
  args: UpdateTimetableArgs,
) {
  const { cleanUpdate, dispatch, scoreConfig, searchConfig, selection, sessionManager } = args;
  const { additional, chosen, custom, events, meta, options, webStreams } = selection;
  const courses = [...chosen, ...custom, ...additional];
  let fixedSessions: LinkedSession[] = [];
  if (!cleanUpdate) {
    fixedSessions = sessionManager.getTouchedSessions(courses, events);
  }

  let newTimetable: TimetableSearchResult | null = null;
  try {
    newTimetable = await doTimetableSearch({
      fixedSessions,
      courses,
      events,
      webStreams,
      options,
      searchConfig,
      scoreConfig,
      ignoreCache: cleanUpdate,
    });
  } catch (error) {
    exception({ description: `Unexpected error in doTimetableSearch. ${error}` });
    console.error(error);
  }

  if (newTimetable === null) {
    // Displace some classes and display a warning
    await dispatch(setNotice('There was a problem generating a timetable'));
  } else {
    try {
      sessionManager.update(newTimetable.timetable, newTimetable.score);
      sessionManager.snapAll();
    } catch (error) {
      exception({ description: `Unexpected error when updating SessionManager. ${error}` });
      console.error(error);
      await dispatch(setNotice('There was a problem generating a timetable'));
      return;
    }

    await dispatch(setTimetable(sessionManager.data, meta));

    await notifyUnplaced(args, newTimetable.unplaced || []);

    if (fixedSessions.length > 0) {
      // Try to calculate a more optimal timetable
      recommendTimetable({ dispatch, selection, scoreConfig });
    } else {
      // Clear outdated recommendation
      await dispatch(setSuggestionScore(null));
    }
  }
}

async function notifyUnplaced(
  args: UpdateTimetableArgs,
  unplaced: LinkedSession[],
) {
  const { dispatch, selection } = args;
  const count = unplaced.length;
  dispatch(setUnplacedCount(count));
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
          const newSelection: TimetableSelection = { ...selection, options: newOptions };
          const newArgs: UpdateTimetableArgs = { ...args, selection: newSelection };
          await updateTimetable(newArgs);
        }}
      >
        Retry
      </Button>
    )];

    const message = messages.join('\n');
    await dispatch(setNotice(message, actions, 15000));
  }
}

export async function recommendTimetable({
  dispatch,
  selection,
  maxSpawn = 1,
  searchConfig = { timeout: 100 },
  scoreConfig,
}: {
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  selection: TimetableSelection,
  maxSpawn?: number,
  searchConfig?: GeneticSearchOptionalConfig,
  scoreConfig: TimetableScoreConfig,
}) {
  const { chosen, custom, additional, events, webStreams, options } = selection;
  const courses = [...chosen, ...custom, ...additional];
  const newTimetable = await doTimetableSearch({
    fixedSessions: [],
    courses,
    events,
    webStreams,
    options,
    maxSpawn,
    searchConfig,
    scoreConfig,
  });

  if (newTimetable !== null) {
    await dispatch(setSuggestionScore(newTimetable.score));
  }
}

export async function doTimetableSearch({
  fixedSessions,
  courses,
  events,
  webStreams,
  options,
  maxSpawn,
  ignoreCache,
  searchConfig,
  scoreConfig,
}: TimetableSearchConfig): Promise<TimetableSearchResult | null> {
  // Remove fixed sessions from full streams
  const includeFull = options.includeFull || false;
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

  let result: TimetableSearchResult;
  try {
    // Search for a new timetable
    // NB: scoring should take fixed sessions into account too
    // NB: full sessions don't matter here, since they can be considered to be 'unplaced'
    result = await search(components, fixed, ignoreCache, searchConfig, scoreConfig, maxSpawn);
  } catch (error) {
    console.error(error);
    exception({ description: `Unexpected error in search. ${error}` });
    return null;
  }

  // Add fixed sessions
  result.timetable.push(...fixed);

  // Add sessions from first stream of any completely full components
  const unplaced = getFullStreamSessions(fullComponents);

  return { ...result, unplaced };
}

function getFullStreamSessions(fullComponents: Component[]) {
  const fullSessions: LinkedSession[] = [];

  for (const component of fullComponents) {
    const course = component.course;
    const firstStream = course.streams[0];
    const linkedStream = linkStream(course, firstStream);
    fullSessions.push(...linkedStream.sessions);
  }

  return fullSessions;
}

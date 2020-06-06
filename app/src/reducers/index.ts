import { combineReducers } from 'redux';
import { meta } from './meta';
import { courses, chosen, custom, additional } from './courses';
import { events, options, hiddenEvents } from './commitments';
import { timetables, suggestionScore, unplacedCount } from './timetables';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';
import { darkMode } from './darkMode';
import { twentyFourHours } from './twentyFourHours';
import { AllActions, UPDATE_SESSION_MANAGER, SET_COURSE_DATA, UNDO, REDO } from '../actions';
import {
  RootState,
  HistoryData,
  getCurrentTerm,
  getCurrentTimetable,
  initialState,
  TimetableHistoryState,
  push,
  redo,
  undo,
} from '../state';
import { SessionManagerData } from '../components/Timetable/SessionManagerTypes';

type NoHistoryState = Omit<RootState, 'history'>;
const basicReducer = combineReducers<RootState>({
  courses,
  custom,
  additional,
  meta,
  chosen,
  events,
  options,
  timetables,
  suggestionScore,
  unplacedCount,
  colours,
  webStreams,
  notice,
  hiddenEvents,
  darkMode,
  twentyFourHours,
  history: state => state || initialState.history,
});

export const getTimetableState = (state: NoHistoryState): TimetableHistoryState => {
  const {
    courses,
    custom,
    additional,
    chosen,
    events,
    options,
    colours,
    webStreams,
  } = state;
  const timetable = getCurrentTimetable(state);
  return {
    courses,
    custom,
    additional,
    chosen,
    events,
    options,
    timetable,
    colours,
    webStreams,
  };
}

function getStateFromHistory(history: HistoryData, nextTimetable: SessionManagerData, nextState: RootState): RootState {
  const { timetable, ...otherHistory } = history.present;
  timetable.version = nextTimetable.version + 1;
  return {
    ...nextState,
    ...otherHistory,
    timetables: { ...nextState.timetables, [getCurrentTerm(nextState.meta)]: timetable },
    history,
  };
}

const historyReducer = (nextState: RootState, action: AllActions): RootState => {
  const nextTimetable = getCurrentTimetable(nextState);
  let history = nextState.history;

  if (action.type === UNDO) {
    history = undo(history);
    return getStateFromHistory(history, nextTimetable, nextState);
  } else if (action.type === REDO) {
    history = redo(history);
    return getStateFromHistory(history, nextTimetable, nextState);
  } else if (action.type === UPDATE_SESSION_MANAGER) {
    history = push(history, getTimetableState(nextState));
    return {
      ...nextState,
      history,
    };
  } else if (action.type === SET_COURSE_DATA) {
    return {
      ...nextState,
      history: {
        ...history,
        present: getTimetableState(nextState),
      },
    };
  }

  return nextState;
}

const rootReducer = (state: RootState | undefined, action: AllActions): RootState => {
  state = state || { ...initialState };
  let nextState = basicReducer(state, action);
  nextState = historyReducer(nextState, action);

  return nextState;
}

export default rootReducer;

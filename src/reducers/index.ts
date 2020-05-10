import { combineReducers } from 'redux';
import { meta } from "./meta";
import { RootState, initialState, TimetableHistoryState } from '../state';
import { courses, chosen, custom, additional } from './courses';
import { events, options, hiddenEvents } from './commitments';
import { timetables, suggestionScore } from './timetables';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';
import { darkMode } from './darkMode';
import { AllActions, UPDATE_SESSION_MANAGER, SET_COURSE_DATA, UNDO, REDO } from '../actions';
import { undo, redo, push, HistoryData } from '../state/StateHistory';
import { getCurrentTerm } from '../state/Meta';
import { SessionManagerData } from '../components/Timetable/SessionManager';
import { getCurrentTimetable } from '../state/selectors';

type NoHistoryState = Omit<RootState, 'history'>;
const basicReducer = combineReducers<NoHistoryState>({
  courses,
  custom,
  additional,
  meta,
  chosen,
  events,
  options,
  timetables,
  suggestionScore,
  colours,
  webStreams,
  notice,
  hiddenEvents,
  darkMode,
});

const removeHistory = (state: RootState): NoHistoryState | undefined => {
  delete state.history;
  return state;
}

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

function getNextState(history: HistoryData, nextTimetable: SessionManagerData, nextState: NoHistoryState): RootState {
  const { timetable, ...otherHistory } = history.present;
  timetable.version = nextTimetable.version + 1;
  return {
    ...nextState,
    ...otherHistory,
    timetables: { ...nextState.timetables, [getCurrentTerm(nextState.meta)]: timetable },
    history,
  };
}

const historyReducer = (nextState: NoHistoryState, history: HistoryData, action: AllActions) => {
  const nextTimetable = getCurrentTimetable(nextState);

  if (action.type === UNDO) {
    history = undo(history);
    return getNextState(history, nextTimetable, nextState);
  } else if (action.type === REDO) {
    history = redo(history);
    return getNextState(history, nextTimetable, nextState);
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
  const history = state.history;
  const noHistory = removeHistory(state);
  let nextState = basicReducer(noHistory, action);
  nextState = historyReducer(nextState, history, action);

  if (nextState === state) {
    state.history = history;
    return state;
  }

  return {
    ...nextState,
    history,
  }
}

export default rootReducer;

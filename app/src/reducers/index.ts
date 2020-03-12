import { combineReducers } from 'redux';
import { meta } from "./meta";
import { RootState, baseState, TimetableState } from '../state';
import { courses, chosen, custom, additional } from './courses';
import { events, options, hiddenEvents } from './commitments';
import { timetable, suggestionScore } from './timetable';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';
import { UNDO, REDO } from '../actions/history';
import { UPDATE_SESSION_MANAGER, SET_COURSE_DATA, AllActions } from '../actions';
import { undo, redo, push } from '../state/StateHistory';

type NoHistoryState = Omit<RootState, 'history'>;
const basicReducer = combineReducers<NoHistoryState>({
  courses,
  custom,
  additional,
  meta,
  chosen,
  events,
  options,
  timetable,
  suggestionScore,
  colours,
  webStreams,
  notice,
  hiddenEvents,
});

const removeHistory = (state: RootState): NoHistoryState | undefined => {
  state = { ...state };
  delete state.history;

  return state;
}

export const getTimetableState = <T extends TimetableState>(state: T): TimetableState => {
  const {
    courses,
    custom,
    additional,
    chosen,
    events,
    options,
    timetable,
    colours,
    webStreams,
  } = state;
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

const rootReducer = (state: RootState | undefined, action: AllActions): RootState => {
  state = state || baseState;
  const nextState = basicReducer(removeHistory(state), action);
  let history = state.history;

  switch (action.type) {
    case UNDO:
      history = undo(history);
      history.present.timetable.version = nextState.timetable.version + 1;
      return {
        ...nextState,
        ...history.present,
        history,
      };
    case REDO:
      history = redo(history);
      history.present.timetable.version = nextState.timetable.version + 1;
      return {
        ...nextState,
        ...history.present,
        history,
      };
    case UPDATE_SESSION_MANAGER:
      history = push(history, getTimetableState(nextState));
      return {
        ...nextState,
        history,
      };
    case SET_COURSE_DATA:
      return {
        ...nextState,
        history: {
          ...history,
          present: getTimetableState(nextState),
        }
      };
  }

  return {
    ...nextState,
    history,
  }
}

export default rootReducer;

import { combineReducers, AnyAction } from 'redux';
import { meta } from "./meta";
import { RootState, baseState, TimetableState, StateHistory } from '../state';
import { courses, chosen, custom, additional } from './courses';
import { events, options } from './commitments';
import { timetable } from './timetable';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';
import { UNDO, REDO } from '../actions/history';
import { UPDATE_SESSION_MANAGER } from '../actions';

type NoHistoryState = Omit<RootState, 'history'>
const basicReducer = combineReducers<NoHistoryState>({
  courses,
  custom,
  additional,
  meta,
  chosen,
  events,
  options,
  timetable,
  colours,
  webStreams,
  notice,
});

const removeHistory = (state: RootState): NoHistoryState | undefined => {
  state = Object.assign({}, state);
  delete state.history;

  return state;
}

export const undo = (history: StateHistory): StateHistory => {
  const { past, present, future } = history;
  return {
    past: [...past.slice(0, past.length - 1)],
    present: past[past.length - 1],
    future: [present, ...future],
  };
}

export const redo = (history: StateHistory): StateHistory => {
  const { past, present, future } = history;
  return {
    past: [...past, present],
    present: future[0],
    future: future.slice(1),
  };
}

export const push = (history: StateHistory, next: TimetableState): StateHistory => {
  const { past, present } = history;
  return {
    past: [...past, present],
    present: next,
    future: [],
  };
}

const rootReducer = (state: RootState | undefined, action: AnyAction): RootState => {
  state = state || baseState;
  const nextState = basicReducer(removeHistory(state), action);
  let history = state ? state.history : baseState.history;

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
      history = push(history, nextState);
      return {
        ...nextState,
        history,
      };
  }

  return {
    ...nextState,
    history,
  }
}

export default rootReducer;

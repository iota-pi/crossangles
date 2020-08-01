import {
  AllActions,
  ADD_COURSE,
  TOGGLE_EVENT,
  TOGGLE_OPTION,
  TOGGLE_SHOW_EVENTS,
} from '../actions';
import { AdditionalEvent, CourseId, getEvents, initialState, Options } from '../state';

export function events(
  state: readonly AdditionalEvent[] = [],
  action: AllActions,
): AdditionalEvent[] {
  if (action.type === TOGGLE_EVENT) {
    const stateIds = state.map(e => e.id);
    const id = action.event.id;
    if (stateIds.includes(id)) {
      const i = stateIds.indexOf(id);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
    }
    return [
      ...state,
      action.event,
    ];
  } else if (action.type === ADD_COURSE) {
    if (action.course.isAdditional && !action.course.autoSelect) {
      const eventList = getEvents(action.course);
      if (eventList.length === 1) {
        return [...state, eventList[0]];
      }
    }
  }

  return state as AdditionalEvent[];
}

export function options(
  state: Options = initialState.options,
  action: AllActions,
): Options {
  if (action.type === TOGGLE_OPTION) {
    return {
      ...state,
      [action.option]: !state[action.option],
    };
  }

  return state;
}

export function hiddenEvents(
  state: readonly CourseId[] = initialState.hiddenEvents,
  action: AllActions,
): CourseId[] {
  if (action.type === TOGGLE_SHOW_EVENTS) {
    if (state.includes(action.course)) {
      const i = state.indexOf(action.course);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
    }

    return [
      ...state,
      action.course,
    ];
  }

  return state as CourseId[];
}

import {
  ADD_COURSE,
  REMOVE_COURSE,
  ADD_CUSTOM,
  REMOVE_CUSTOM,
  ADD_EVENT,
  REMOVE_EVENT,
  TOGGLE_OPTION,
  ToggleOptionAction
} from '../actions/selection';
import { AnyAction } from 'redux';
import {
  baseChosen,
  baseCustom,
  baseEvents,
  baseOptions,
  CustomCourse,
  CBSEvent,
  Options,
} from '../state';
import { Course } from "../state/Course";

export function chosen (state = baseChosen, action: AnyAction): Course[] {
  switch (action.type) {
    case ADD_COURSE:
      return [
        ...state,
        action.course,
      ]
    case REMOVE_COURSE:
      const i = state.indexOf(action.course);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ]
  }

  return state;
};

export function custom (state = baseCustom, action: AnyAction): CustomCourse[] {
  switch (action.type) {
    case ADD_CUSTOM:
      return [
        ...state,
        action.custom,
      ]
    case REMOVE_CUSTOM:
      const i = state.indexOf(action.custom);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ]
  }

  return state;
};

export function events (state = baseEvents, action: AnyAction): CBSEvent[] {
  switch (action.type) {
    case ADD_EVENT:
      return [
        ...state,
        action.event,
      ]
    case REMOVE_EVENT:
      const i = state.indexOf(action.event);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ]
  }

  return state;
};

export function options (state = baseOptions, action: ToggleOptionAction): Options {
  switch (action.type) {
    case TOGGLE_OPTION:
      return {
        ...state,
        [action.option]: !state[action.option],
      }
  }

  return state;
};

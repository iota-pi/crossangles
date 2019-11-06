import {
  ADD_COURSE,
  REMOVE_COURSE,
  ADD_CUSTOM,
  REMOVE_CUSTOM,
  TOGGLE_EVENT,
  TOGGLE_OPTION,
  ToggleOptionAction,
  EventAction,
  CourseAction,
  CustomAction,
} from '../actions/selection';
import {
  Course,
  baseChosen,
  baseCustom,
  baseEvents,
  baseOptions,
  CustomCourse,
  CBSEvent,
  Options,
  baseAdditional,
} from '../state';
import { SET_COURSE_DATA, CoursesAction } from '../actions/fetch';
import { CBS_CODE, CourseId } from '../state/Course';

export function chosen (state = baseChosen, action: CourseAction | CoursesAction): CourseId[] {
  switch (action.type) {
    case ADD_COURSE:
      return [
        ...state,
        action.course.id,
      ];
    case REMOVE_COURSE:
      const i = state.indexOf(action.course.id);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
    case SET_COURSE_DATA:
      // Only keep chosen courses which have current data
      // NB: this should only be necessary if a course stops being offered for a particular term
      //     after timetable data has been released (very unlikely)
      const newIds = new Set(action.courses.map(c => (new Course(c)).id));
      return state.filter(id => newIds.has(id));
  }

  return state;
};

export function custom (state = baseCustom, action: CustomAction): CourseId[] {
  switch (action.type) {
    case ADD_CUSTOM:
      return [
        ...state,
        action.custom.code,
      ];
    case REMOVE_CUSTOM:
      const i = state.indexOf(action.custom.code);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
  }

  return state;
};

export function additional (state = baseAdditional, action: CoursesAction): CourseId[] {
  switch (action.type) {
    case SET_COURSE_DATA:
      return action.courses.filter(c => c.code === CBS_CODE).map(c => (new Course(c)).id);
  }

  return state;
};

export function events (state = baseEvents, action: EventAction): CBSEvent[] {
  switch (action.type) {
    case TOGGLE_EVENT:
      if (!state.includes(action.event)) {
        return [
          ...state,
          action.event,
        ];
      } else {
        const i = state.indexOf(action.event);
        return [
          ...state.slice(0, i),
          ...state.slice(i + 1),
        ];
      }
  }

  return state;
};

export function options (state = baseOptions, action: ToggleOptionAction): Options {
  switch (action.type) {
    case TOGGLE_OPTION:
      return {
        ...state,
        [action.option]: !state[action.option],
      };
  }

  return state;
};

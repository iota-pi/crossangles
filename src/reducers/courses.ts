import { SET_COURSE_DATA, ADD_COURSE, REMOVE_COURSE, ADD_CUSTOM, REMOVE_CUSTOM, UPDATE_CUSTOM, AllActions } from '../actions';
import { CourseMap, CourseId, getCourseId } from '../state/Course';
import { initialState } from '../state';

export function courses (
  state: CourseMap = initialState.courses,
  action: AllActions,
): CourseMap {
  if (action.type === SET_COURSE_DATA) {
    const allCourses: CourseMap = {};

    // Return with new course data
    for (const course of action.courses) {
      const id = getCourseId(course);
      allCourses[id] = course;
    }

    return { ...state, ...allCourses };
  }

  if (action.type === ADD_CUSTOM || action.type === UPDATE_CUSTOM) {
    return {
      ...state,
      [getCourseId(action.custom)]: action.custom,
    };
  }

  if (action.type === REMOVE_CUSTOM) {
    state = { ...state };
    delete state[getCourseId(action.custom)];
    return state;
  }

  return state;
};

export function chosen (
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  if (action.type === ADD_COURSE) {
    return [
      ...state,
      getCourseId(action.course),
    ];
  }

  if (action.type === REMOVE_COURSE) {
    const i = state.indexOf(getCourseId(action.course));
    return [
      ...state.slice(0, i),
      ...state.slice(i + 1),
    ];
  }

  if (action.type === SET_COURSE_DATA) {
    // Only keep chosen courses which have current data
    // NB: this would be necessary if a course stops being offered for a particular term
    //     after the timetable data has already been released (fairly unlikely)
    const newIds = new Set(action.courses.map(c => getCourseId(c)));
    const newState = state.filter(id => newIds.has(id));
    if (newState.length === state.length) {
      return state;
    }
    return newState;
  }

  return state;
};

export function custom (
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  if (action.type === ADD_CUSTOM) {
    return [...state, getCourseId(action.custom)];
  }

  if (action.type === REMOVE_CUSTOM) {
    const i = state.indexOf(getCourseId(action.custom));
    return [...state.slice(0, i), ...state.slice(i + 1)];
  }

  return state;
}

export function additional (
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  if (action.type === SET_COURSE_DATA) {
    return action.courses.filter(c => c.isAdditional && c.autoSelect).map(c => getCourseId(c));
  } else if (action.type === REMOVE_COURSE) {
    if (action.course.isAdditional) {
      return state.filter(c => c !== getCourseId(action.course));
    }
  }

  return state;
}

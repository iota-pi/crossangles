import { SET_COURSE_DATA, ADD_COURSE, REMOVE_COURSE, ADD_CUSTOM, REMOVE_CUSTOM, UPDATE_CUSTOM, AllActions } from "../actions";
import { CourseMap, CourseId, getCourseId } from "../state/Course";
import { initialState } from "../state";

export function courses (
  state: CourseMap = initialState.courses,
  action: AllActions,
): CourseMap {
  switch (action.type) {
    case SET_COURSE_DATA:
      const allCourses: CourseMap = {};

      // Add in previously existing custom courses
      // TODO: is this necessary?
      for (const [id, course] of Object.entries(state)) {
        if (course.isCustom) {
          allCourses[id] = course;
        }
      }

      // Return with new course data
      for (const course of action.courses) {
        const id = getCourseId(course);
        allCourses[id] = course;
      }

      return { ...state, ...allCourses };
    case ADD_CUSTOM:
      return {
        ...state,
        [getCourseId(action.custom)]: action.custom,
      }
    case REMOVE_CUSTOM:
      const clonedState = Object.assign({}, state);
      delete clonedState[getCourseId(action.custom)];
      return clonedState;
    case UPDATE_CUSTOM:
      return {
        ...state,
        [getCourseId(action.custom)]: action.custom,
      }
  }

  return state;
};

export function chosen (
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  switch (action.type) {
    case ADD_COURSE:
      return [
        ...state,
        getCourseId(action.course),
      ];
    case REMOVE_COURSE:
      const i = state.indexOf(getCourseId(action.course));
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
    case SET_COURSE_DATA:
      // Only keep chosen courses which have current data
      // NB: this should only be necessary if a course stops being offered for a particular term
      //     after timetable data has been released (very unlikely)
      const newIds = new Set(action.courses.map(c => getCourseId(c)));
      return state.filter(id => newIds.has(id));
  }

  return state;
};

export function custom (
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  let i: number;
  switch (action.type) {
    case ADD_CUSTOM:
      return [...state, getCourseId(action.custom)];
    case REMOVE_CUSTOM:
      i = state.indexOf(getCourseId(action.custom));
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

import { CourseListAction, ADD_COURSE, SET_COURSE_DATA, CourseAction, REMOVE_COURSE, OtherAction, CustomAction, ADD_CUSTOM, REMOVE_CUSTOM, UPDATE_CUSTOM } from "../actions";
import { CourseMap, CourseId, getCourseId, CBS_CODE } from "../state/Course";
import { baseState } from "../state";

export function courses (
  state: CourseMap = baseState.courses,
  action: CourseListAction | CustomAction | OtherAction,
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
  action: CourseAction | CourseListAction | OtherAction
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
  action: CustomAction | OtherAction,
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
  action: CourseListAction | OtherAction,
): CourseId[] {
  switch (action.type) {
    case SET_COURSE_DATA:
      return action.courses.filter(c => c.code === CBS_CODE).map(c => getCourseId(c));
  }

  return state;
}

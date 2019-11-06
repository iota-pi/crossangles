import { SET_COURSE_DATA, CoursesAction } from '../actions/fetch';
import { baseCourses, CourseId } from '../state';
import { TOGGLE_WEB_STREAM, CourseAction, ADD_CUSTOM, CustomAction, REMOVE_CUSTOM } from '../actions/selection';
import { Course } from '../state';

export function courses (
  state = baseCourses,
  action: CourseAction | CoursesAction | CustomAction,
): Map<CourseId, Course> {
  let newMap: typeof state;
  switch (action.type) {
    case SET_COURSE_DATA:
      const courses: Course[] = action.courses.map(courseData => new Course(courseData));
      return new Map(courses.map(course => [course.id, course]));
    case TOGGLE_WEB_STREAM:
      newMap = new Map(state);
      return newMap.set(action.course.id, new Course({
        ...action.course.data,
        useWebStream: !action.course.useWebStream,
      }));
    case ADD_CUSTOM:
      newMap = new Map(state);
      return newMap.set(action.custom.code, action.custom);
    case REMOVE_CUSTOM:
      newMap = new Map(state);
      newMap.delete(action.custom.code);
      return newMap;
  }

  return state;
};

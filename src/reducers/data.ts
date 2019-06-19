import { SET_COURSE_DATA, SET_META_DATA, CoursesAction } from '../actions/fetch';
import { AnyAction } from 'redux';
import { Meta, baseCourses, baseMeta, CourseId } from '../state';
import { TOGGLE_WEB_STREAM, CourseAction } from '../actions/selection';
import { Course } from '../state';

export function courses (state = baseCourses, action: CourseAction | CoursesAction): Map<CourseId, Course> {
  switch (action.type) {
    case SET_COURSE_DATA:
      const courses: Course[] = action.courses.map(courseData => new Course(courseData));
      return new Map(courses.map(course => [course.id, course]));
    case TOGGLE_WEB_STREAM:
      const newMap = new Map(state);
      return newMap.set(action.course.id, new Course({
        ...action.course.data,
        useWebStream: !action.course.useWebStream,
      }));
  }

  return state;
};

export function meta (state = baseMeta, action: AnyAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta
  }

  return state;
};

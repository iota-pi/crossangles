import { SET_COURSE_DATA, CoursesAction } from '../actions/fetch';
import { baseCourses, CourseMap } from '../state';
import { Course } from '../state';

export function courses (
  state = baseCourses,
  action: CoursesAction,
): CourseMap {
  switch (action.type) {
    case SET_COURSE_DATA:
      const courses: Course[] = action.courses.map(courseData => new Course(courseData));
      return new Map(courses.map(course => [course.id, course]));
  }

  return state;
};

import { SET_COURSE_DATA, CoursesAction } from '../actions/fetch';
import { baseCourses, CourseId } from '../state';
import { Course } from '../state';

export function courses (
  state = baseCourses,
  action: CoursesAction,
): Map<CourseId, Course> {
  switch (action.type) {
    case SET_COURSE_DATA:
      const courses: Course[] = action.courses.map(courseData => new Course(courseData));
      return new Map(courses.map(course => [course.id, course]));
  }

  return state;
};

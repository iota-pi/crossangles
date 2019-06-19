import { createTransform } from 'redux-persist';
import { Course, CourseId } from '.';
import { CourseData } from './Course';

export const coursesTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Map<CourseId, Course>, key) => {
    return Array.from(inboundState.values()).map(course => course.data);
  },
  // transform state being rehydrated
  (outboundState: CourseData[], key) => {
    const courses: Course[] = outboundState.map(courseData => new Course(courseData));
    return new Map(courses.map(c => [c.id, c]));
  },
  // define which reducers this transform gets called for.
  { whitelist: ['courses'] }
);

export default coursesTransform;

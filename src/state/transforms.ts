import { createTransform } from 'redux-persist';
import { Course, CourseId, CustomCourse } from '.';
import { CourseData } from './Course';

export const coursesTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Map<CourseId, Course>) => {
    return Array.from(inboundState.values()).map(course => course.data);
  },
  // transform state being rehydrated
  (outboundState: CourseData[]) => {
    const courses: Course[] = outboundState.map(courseData => new Course(courseData));
    return new Map(courses.map(c => [c.id, c]));
  },
  // define which reducers this transform gets called for.
  { whitelist: ['courses'] },
);

export const customTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: CustomCourse[]) => {
    return inboundState.map(course => course.data);
  },
  // transform state being rehydrated
  (outboundState: CourseData[]) => {
    return outboundState.map(courseData => new CustomCourse(courseData));
  },
  // define which reducers this transform gets called for.
  { whitelist: ['custom'] },
);

export const coloursTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Map<CourseId, string>) => {
    return Array.from(inboundState.entries());
  },
  // transform state being rehydrated
  (outboundState: [CourseId, string][]) => {
    return new Map(outboundState);
  },
  // define which reducers this transform gets called for.
  { whitelist: ['colours'] },
);

export const webStreamsTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: Set<CourseId>) => {
    return Array.from(inboundState.values());
  },
  // transform state being rehydrated
  (outboundState: CourseId[]) => {
    return new Set(outboundState);
  },
  // define which reducers this transform gets called for.
  { whitelist: ['webStreams'] },
);

export default [ coursesTransform, customTransform, coloursTransform, webStreamsTransform ];

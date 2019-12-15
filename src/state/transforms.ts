import { createTransform } from 'redux-persist';
import { CourseId } from '.';
import { CourseManager, StoredCourseManager } from './CourseManager';

export const coursesTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: CourseManager) => {
    return inboundState.store();
  },
  // transform state being rehydrated
  (outboundState: StoredCourseManager) => {
    return CourseManager.load(outboundState);
  },
  // define which reducers this transform gets called for.
  { whitelist: ['courses'] },
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

export default [
  coursesTransform,
  coloursTransform,
  webStreamsTransform,
];

import { CourseId, baseWebStreams } from '../state';
import { TOGGLE_WEB_STREAM, CourseAction } from '../actions/selection';

export function webStreams (state = baseWebStreams, action: CourseAction): Set<CourseId> {
  const streams = new Set(state);
  switch (action.type) {
    case TOGGLE_WEB_STREAM:
      if (streams.has(action.course.id)) {
        streams.delete(action.course.id);
      } else {
        streams.add(action.course.id);
      }
      return streams;
  }

  return state;
};

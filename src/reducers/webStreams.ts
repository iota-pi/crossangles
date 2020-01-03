import { CourseId, getCourseId } from '../state/Course';
import { TOGGLE_WEB_STREAM, CourseAction } from '../actions/selection';

export function webStreams (
  state: CourseId[] | undefined, action: CourseAction
): CourseId[] {
  switch (action.type) {
    case TOGGLE_WEB_STREAM:
      const streams = [...state];
      const courseId = getCourseId(action.course);
      const index = streams.indexOf(courseId);
      if (index > -1) {
        streams.splice(index, 1);
      } else {
        streams.push(courseId);
      }
      return streams;
  }

  return state || [];
};

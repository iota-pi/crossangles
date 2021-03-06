import { AllActions, TOGGLE_WEB_STREAM } from '../actions';
import { CourseId, getCourseId, initialState } from '../state';

export function webStreams(
  state: CourseId[] | undefined,
  action: AllActions,
): CourseId[] {
  if (action.type === TOGGLE_WEB_STREAM) {
    const streams = state ? [...state] : [];
    const courseId = getCourseId(action.course);
    const index = streams.indexOf(courseId);
    if (index > -1) {
      streams.splice(index, 1);
    } else {
      streams.push(courseId);
    }
    return streams;
  }

  return state || initialState.webStreams;
}

export default webStreams;

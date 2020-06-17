import { AllActions, SET_COURSE_DATA } from '../actions';
import { initialState, Meta } from '../state';

export function meta(state: Meta | undefined, action: AllActions): Meta {
  if (action.type === SET_COURSE_DATA && action.meta) {
    return action.meta;
  }

  return state || initialState.meta;
}

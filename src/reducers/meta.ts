import { AllActions, SET_META_DATA } from '../actions';
import { initialState, Meta } from '../state';

export function meta(state: Meta | undefined, action: AllActions): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }

  return state || initialState.meta;
}

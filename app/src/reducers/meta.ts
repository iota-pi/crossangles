import { SET_META_DATA } from '../actions/fetchData';
import { AllActions } from '../actions';
import { initialState } from '../state';
import { Meta } from '../state/Meta';

export function meta(state: Meta | undefined, action: AllActions): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }

  return state || initialState.meta;
}

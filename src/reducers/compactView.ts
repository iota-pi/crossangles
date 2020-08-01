import { AllActions, SET_COMPACT_VIEW } from '../actions';
import { initialState } from '../state';

export const compactView = (state = initialState.compactView, action: AllActions): boolean => {
  if (action.type === SET_COMPACT_VIEW) {
    if (action.compactView === true) {
      return action.compactView;
    }
    return !state;
  }

  return state;
};

export default compactView;

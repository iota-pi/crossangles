import { AllActions } from '../actions';
import { initialState } from '../state';
import { SET_DARK_MODE } from '../actions/darkMode';

export const darkMode = (state = initialState.darkMode, action: AllActions): boolean => {
  if (action.type === SET_DARK_MODE) {
    if (action.darkMode === true) {
      return action.darkMode;
    } else {
      return !state;
    }
  }

  return state;
};

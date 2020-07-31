import { AllActions, SET_DARK_MODE } from '../actions';
import { initialState } from '../state';

export const darkMode = (state = initialState.darkMode, action: AllActions): boolean => {
  if (action.type === SET_DARK_MODE) {
    if (action.darkMode === true) {
      return action.darkMode;
    }
    return !state;
  }

  return state;
};

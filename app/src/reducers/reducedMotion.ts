import { AllActions, SET_REDUCED_MOTION } from '../actions';
import { initialState } from '../state';

export const reducedMotion = (state = initialState.reducedMotion, action: AllActions): boolean => {
  if (action.type === SET_REDUCED_MOTION) {
    if (action.reducedMotion === true) {
      return action.reducedMotion;
    }
    return !state;
  }

  return state;
};

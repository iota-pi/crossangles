import { AllActions, SET_TWENTY_FOUR_HOURS } from '../actions';
import { initialState } from '../state';

export const twentyFourHours = (state = initialState.twentyFourHours, action: AllActions): boolean => {
  if (action.type === SET_TWENTY_FOUR_HOURS) {
    if (action.twentyFourHours === true) {
      return action.twentyFourHours;
    } else {
      return !state;
    }
  }

  return state;
};

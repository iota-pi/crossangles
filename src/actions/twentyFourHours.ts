import { Action } from 'redux';

export const SET_TWENTY_FOUR_HOURS = 'SET_TWENTY_FOUR_HOURS';
export interface SetTwentyFourHoursAction extends Action {
  type: typeof SET_TWENTY_FOUR_HOURS,
  twentyFourHours?: boolean,
}
export const setTwentyFourHours = (twentyFourHours?: boolean): SetTwentyFourHoursAction => {
  return {
    type: SET_TWENTY_FOUR_HOURS,
    twentyFourHours,
  };
};

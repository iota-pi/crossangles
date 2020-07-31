import { Action } from 'redux';

export const SET_REDUCED_MOTION = 'SET_REDUCED_MOTION';
export interface SetReducedMotionAction extends Action {
  type: typeof SET_REDUCED_MOTION,
  reducedMotion?: boolean,
}
export const setReducedMotion = (reducedMotion?: boolean): SetReducedMotionAction => ({
  type: SET_REDUCED_MOTION,
  reducedMotion,
});

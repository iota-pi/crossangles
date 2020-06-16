import { Action } from 'redux';

export const SET_COMPACT_VIEW = 'SET_COMPACT_VIEW';
export interface SetCompactViewAction extends Action {
  type: typeof SET_COMPACT_VIEW,
  compactView?: boolean,
}
export const setCompactView = (compactView?: boolean): SetCompactViewAction => {
  return {
    type: SET_COMPACT_VIEW,
    compactView,
  };
};

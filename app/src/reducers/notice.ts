import { Notice } from '../state/Notice';
import { SET_NOTICE, CLEAR_NOTICE, AllActions } from '../actions';
import { baseState } from '../state';

export function notice (
  state = baseState.notice,
  action: AllActions
): Notice | null {
  switch (action.type) {
    case SET_NOTICE:
      const { message, actions } = action;
      return { message, actions };
    case CLEAR_NOTICE:
      return null;
  }

  return state;
};

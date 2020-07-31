import { SET_NOTICE, CLEAR_NOTICE, AllActions } from '../actions';
import { initialState, Notice } from '../state';

export function notice(
  state = initialState.notice,
  action: AllActions,
): Notice | null {
  switch (action.type) {
    case SET_NOTICE:
      const { message, actions, timeout } = action;
      return { message, actions, timeout };
    case CLEAR_NOTICE:
      return null;
  }

  return state;
}

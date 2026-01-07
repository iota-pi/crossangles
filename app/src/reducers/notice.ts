import { SET_NOTICE, CLEAR_NOTICE, AllActions } from '../actions';
import { initialState, Notice } from '../state';

export function notice(
  state = initialState.notice,
  action: AllActions,
): Notice | null {
  if (action.type === SET_NOTICE) {
    const { message, actions, timeout, callback } = action;
    return { message, actions, timeout, callback };
  } else if (action.type === CLEAR_NOTICE) {
    return null;
  }

  return state;
}

export default notice;

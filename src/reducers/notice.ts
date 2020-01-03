import { Notice } from '../state/Notice';
import { NoticeAction, SET_NOTICE, CLEAR_NOTICE, OtherAction } from '../actions';
import { baseState } from '../state';

export function notice (
  state = baseState.notice,
  action: NoticeAction | OtherAction
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

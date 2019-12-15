import { baseNotice, Notice } from '../state';
import { NoticeAction, SET_NOTICE, CLEAR_NOTICE, OtherAction } from '../actions';

export function notice (state = baseNotice, action: NoticeAction | OtherAction): Notice | null {
  switch (action.type) {
    case SET_NOTICE:
      const { message, actions } = action;
      return { message, actions };
    case CLEAR_NOTICE:
      return null;
  }

  return state;
};

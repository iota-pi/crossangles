import { Action } from "redux";
import { Notice } from "../state/Notice";
import { ReactNode } from "react";

// Chosen courses
export const SET_NOTICE = 'SET_NOTICE';
export const CLEAR_NOTICE = 'CLEAR_NOTICE';

export interface SetNoticeAction extends Action, Notice {
  type: typeof SET_NOTICE,
}

export interface ClearNoticeAction extends Action {
  type: typeof CLEAR_NOTICE,
}

export type NoticeAction = SetNoticeAction | ClearNoticeAction;

export function setNotice (message: string, actions?: ReactNode[]): NoticeAction {
  return {
    type: SET_NOTICE,
    message,
    actions: actions || [],
  };
}

export function clearNotice (): NoticeAction {
  return {
    type: CLEAR_NOTICE,
  };
}

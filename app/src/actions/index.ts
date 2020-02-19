import { Action } from 'redux';
import { ColourAction } from './colours';
import { CourseListAction, MetaAction } from './fetchData';
import { HistoryAction } from './history';
import { NoticeAction } from './notice';
import { CourseAction, CustomAction, EventAction, ToggleShowEventsAction, ToggleOptionAction } from './selection';
import { SessionManagerAction, SuggestionAction } from './timetable';

export * from './fetchData';
export * from './selection';
export * from './timetable';
export * from './colours';
export * from './notice';

export interface UserAction extends Action {
  isUser: true,
}

export type AllActions = ColourAction | CourseListAction | MetaAction | HistoryAction | NoticeAction | CourseAction | CustomAction | EventAction | ToggleShowEventsAction | ToggleOptionAction | SessionManagerAction | SuggestionAction;

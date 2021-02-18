import { ColourAction } from './colours';
import { CourseListAction } from './fetchData';
import { HistoryAction } from './history';
import { NoticeAction, SetChangelogViewAction } from './notice';
import { CourseAction, EventAction, ToggleShowEventsAction, ToggleOptionAction } from './selection';
import { SessionManagerAction, SuggestionAction, UnplacedCountAction } from './timetable';

export * from './colours';
export * from './fetchData';
export * from './history';
export * from './notice';
export * from './selection';
export * from './timetable';

export type AllActions = (
  ColourAction |
  CourseListAction |
  HistoryAction |
  NoticeAction |
  CourseAction |
  EventAction |
  ToggleShowEventsAction |
  ToggleOptionAction |
  SessionManagerAction |
  SuggestionAction |
  UnplacedCountAction |
  SetChangelogViewAction
);

import { ColourAction } from './colours';
import { CourseListAction, MetaAction } from './fetchData';
import { HistoryAction } from './history';
import { NoticeAction } from './notice';
import { CourseAction, EventAction, ToggleShowEventsAction, ToggleOptionAction } from './selection';
import { SessionManagerAction, SuggestionAction } from './timetable';
import { SetDarkModeAction } from './darkMode';

export * from './fetchData';
export * from './selection';
export * from './timetable';
export * from './colours';
export * from './notice';

export type AllActions = ColourAction | CourseListAction | MetaAction | HistoryAction | NoticeAction | CourseAction | EventAction | ToggleShowEventsAction | ToggleOptionAction | SessionManagerAction | SuggestionAction | SetDarkModeAction;

import { ColourAction } from './colours';
import { SetDarkModeAction } from './darkMode';
import { CourseListAction, MetaAction } from './fetchData';
import { HistoryAction } from './history';
import { NoticeAction } from './notice';
import { CourseAction, EventAction, ToggleShowEventsAction, ToggleOptionAction } from './selection';
import { SessionManagerAction, SuggestionAction } from './timetable';
import { SetTwentyFourHoursAction } from './twentyFourHours';

export * from './colours';
export * from './darkMode';
export * from './fetchData';
export * from './history';
export * from './notice';
export * from './selection';
export * from './timetable';
export * from './twentyFourHours';

export type AllActions = ColourAction | CourseListAction | MetaAction | HistoryAction | NoticeAction | CourseAction | EventAction | ToggleShowEventsAction | ToggleOptionAction | SessionManagerAction | SuggestionAction | SetDarkModeAction | SetTwentyFourHoursAction;

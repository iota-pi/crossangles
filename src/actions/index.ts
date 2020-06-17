import { ColourAction } from './colours';
import { SetDarkModeAction } from './darkMode';
import { CourseListAction } from './fetchData';
import { HistoryAction } from './history';
import { NoticeAction } from './notice';
import { CourseAction, EventAction, ToggleShowEventsAction, ToggleOptionAction } from './selection';
import { SessionManagerAction, SuggestionAction, UnplacedCountAction } from './timetable';
import { SetTwentyFourHoursAction } from './twentyFourHours';
import { SetCompactViewAction } from './compactView';
import { SetReducedMotionAction } from './reducedMotion';

export * from './colours';
export * from './darkMode';
export * from './fetchData';
export * from './history';
export * from './notice';
export * from './selection';
export * from './timetable';
export * from './twentyFourHours';
export * from './compactView';
export * from './reducedMotion';

export type AllActions = ColourAction | CourseListAction | HistoryAction | NoticeAction | CourseAction | EventAction | ToggleShowEventsAction | ToggleOptionAction | SessionManagerAction | SuggestionAction | UnplacedCountAction | SetDarkModeAction | SetTwentyFourHoursAction | SetCompactViewAction | SetReducedMotionAction;

import { ColourAction } from './colours'
import { CourseListAction } from './fetchData'
import { HistoryAction } from './history'
import { NoticeAction, SetChangelogViewAction } from './notice'
import { CourseAction, EventAction, ToggleShowEventsAction, ToggleOptionAction, SetScoreConfigAction } from './selection'
import { SessionManagerAction, SuggestionAction, UnplacedCountAction } from './timetable'

export * from './colours'
export * from './fetchData'
export * from './history'
export * from './notice'
export * from './selection'
export * from './timetable'

export type AllActions = (
  ColourAction |
  CourseAction |
  CourseListAction |
  EventAction |
  HistoryAction |
  NoticeAction |
  SessionManagerAction |
  SetChangelogViewAction |
  SetScoreConfigAction |
  SuggestionAction |
  ToggleOptionAction |
  ToggleShowEventsAction |
  UnplacedCountAction
)

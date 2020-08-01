import { SessionManagerData } from '../components/Timetable/SessionManagerTypes';
import { getCurrentTimetable } from './selectors';
import { RootState, TimetableHistoryState } from '.';

export type Timetables = {[term: string]: SessionManagerData};

type NoHistoryState = Omit<RootState, 'history'>;
export function getTimetableState(state: NoHistoryState): TimetableHistoryState {
  const {
    courses,
    custom,
    additional,
    chosen,
    events,
    options,
    colours,
    webStreams,
  } = state;
  const timetable = getCurrentTimetable(state);
  return {
    courses,
    custom,
    additional,
    chosen,
    events,
    options,
    timetable,
    colours,
    webStreams,
  };
}

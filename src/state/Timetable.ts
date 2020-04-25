import { RootState } from '.';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { getCurrentTerm } from './Meta';

export type Timetables = {[term: string]: SessionManagerData};

export const getCurrentTimetable = (state: Pick<RootState, 'timetables' | 'meta'>) => {
  const term = getCurrentTerm(state.meta);
  const timetable = state.timetables[term];
  if (timetable) {
    return timetable;
  } else {
    return new SessionManager().data;
  }
}

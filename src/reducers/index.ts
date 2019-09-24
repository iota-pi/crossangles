import { combineReducers } from 'redux';
import { courses, meta } from './data';
import { RootState } from '../state';
import { chosen, custom, events, options, additional } from './commitments';
import { timetable } from './timetable';
import { timetableVersion } from './timetableVersion';
import { colours } from './colours';
import { notice } from './notice';

export default combineReducers<RootState>({
  courses,
  meta,
  chosen,
  additional,
  custom,
  events,
  options,
  timetable,
  timetableVersion,
  colours,
  notice,
});

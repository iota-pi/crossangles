import { combineReducers } from 'redux';
import { courses, meta } from './data';
import { RootState } from '../state';
import { chosen, custom, events, options, additional } from './commitments';
import { timetable } from './timetable';

export default combineReducers<RootState>({
  courses,
  meta,
  chosen,
  additional,
  custom,
  events,
  options,
  timetable,
});

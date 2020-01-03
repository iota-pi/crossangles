import { combineReducers } from 'redux';
import { meta } from "./meta";
import { RootState } from '../state';
import { courses, chosen, custom, additional } from './courses';
import { events, options } from './commitments';
import { timetable } from './timetable';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';

export default combineReducers<RootState>({
  courses,
  custom,
  additional,
  meta,
  chosen,
  events,
  options,
  timetable,
  colours,
  webStreams,
  notice,
});

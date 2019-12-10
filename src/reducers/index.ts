import { combineReducers } from 'redux';
import { courses } from './courses';
import { meta } from "./meta";
import { RootState } from '../state';
import { chosen, custom, events, options, additional } from './commitments';
import { sessionManager } from './sessionManager';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';

export default combineReducers<RootState>({
  courses,
  meta,
  chosen,
  additional,
  custom,
  events,
  options,
  sessionManager,
  colours,
  webStreams,
  notice,
});

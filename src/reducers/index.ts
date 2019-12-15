import { combineReducers } from 'redux';
import { meta } from "./meta";
import { RootState } from '../state';
import { courses, chosen } from './courses';
import { events, options } from './commitments';
import { sessionManager } from './sessionManager';
import { colours } from './colours';
import { webStreams } from './webStreams';
import { notice } from './notice';

export default combineReducers<RootState>({
  courses,
  meta,
  chosen,
  events,
  options,
  sessionManager,
  colours,
  webStreams,
  notice,
});

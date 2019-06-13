import { combineReducers } from 'redux';
import { courses, meta } from './data';
import { RootState } from '../state';
import { chosen, custom, events, options } from './commitments';

export default combineReducers<RootState>({
  courses,
  meta,
  chosen,
  custom,
  events,
  options,
});

import { Action } from 'redux';

export * from './fetchData';
export * from './selection';
export * from './timetable';
export * from './colours';
export * from './notice';

const OTHER_ACTION = "__OTHER_ACTION__";
export interface OtherAction extends Action {
  type: typeof OTHER_ACTION,
}

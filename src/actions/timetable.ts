import { Timetable, Course, CBSEvent, Options } from '../state';
import { Action } from 'redux';
import { search } from '../timetable/timetableSearch';
import { coursesToComponents } from '../timetable/coursesToComponents';

export const UPDATE_TIMETABLE = 'UPDATE_TIMETABLE';
export interface TimetableAction extends Action {
  type: typeof UPDATE_TIMETABLE;
  timetable: Timetable;
}

export interface UpdateTimetableConfig {
  previousTimetable: Timetable;
  courses: Course[];
  events: CBSEvent[];
  options: Options;
}

export function updateTimetable (config: UpdateTimetableConfig): TimetableAction {
  const {
    previousTimetable,
    courses,
    events,
    options: {
      includeFull,
    },
  } = config;
  const components = coursesToComponents(courses, events, includeFull);
  const newTimetable = search(components, previousTimetable);
  return {
    type: UPDATE_TIMETABLE,
    timetable: newTimetable || previousTimetable,
  }
}

import { baseTimetable, Timetable } from '../state';
import { UPDATE_TIMETABLE, TimetableAction } from '../actions';

export function timetable (state = baseTimetable, action: TimetableAction): Timetable {
  switch (action.type) {
    case UPDATE_TIMETABLE:
      return action.timetable;
  }

  return state;
};

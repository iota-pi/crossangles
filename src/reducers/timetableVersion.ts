import { baseTimetableVersion } from '../state';
import { BUMP_TIMETABLE_VERSION, TimetableVersionAction } from '../actions';

export function timetableVersion (state = baseTimetableVersion, action: TimetableVersionAction): number {
  switch (action.type) {
    case BUMP_TIMETABLE_VERSION:
      return state + 1;
  }

  return state;
};

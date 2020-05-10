import { getCurrentTimetable } from './selectors';
import { initialState } from '.';
import { getEmptySessionManagerData, SessionManagerData } from '../components/Timetable/SessionManagerTypes';


describe('getCurrentTimetable', () => {
  it('gives the correct value', () => {
    const timetable: SessionManagerData = {
      map: [],
      order: [],
      score: 0,
      version: 0,
    }
    const state = {
      timetables: {
        '2020~2': timetable,
      },
      meta: {
        ...initialState.meta,
        year: 2020,
        term: 2,
      },
    };
    expect(getCurrentTimetable(state)).toBe(timetable);
    expect(getCurrentTimetable(state)).toBe(timetable);
  });

  it('defaults to an empty timetable', () => {
    const state = {
      timetables: {},
      meta: initialState.meta,
    };
    expect(getCurrentTimetable(state)).toEqual(getEmptySessionManagerData());
  });
});

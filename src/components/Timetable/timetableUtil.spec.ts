import { getTimetableHeight } from './timetableUtil';

describe('getTimetableHeight', () => {
  it.each(
    [
      [10, false, false, 650],
      [8, false, false, 530],
      [10, true, false, 550],
      [5, true, false, 300],
      [10, false, true, 850],
      [10, true, true, 850],
    ],
  )('returns correct value', (duration, compact, showMode, expected) => {
    const result = getTimetableHeight(duration, compact, showMode);
    expect(result).toBe(expected);
  });
});

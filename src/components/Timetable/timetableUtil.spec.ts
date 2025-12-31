import { findDaysToDisplay, getOverlapArea, getTimetableHeight } from './timetableUtil';

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


describe('getOverlapArea', () => {
  it('handles no overlap', () => {
    const result = getOverlapArea(
      { x: 5, y: 5, width: 3, height: 3 },
      { x: 5, y: 8, width: 3, height: 3 },
    );
    expect(result).toEqual(0);
  });

  it('handles identical rectangles', () => {
    const result = getOverlapArea(
      { x: 5, y: 5, width: 3, height: 3 },
      { x: 5, y: 5, width: 3, height: 3 },
    );
    expect(result).toEqual(3 * 3);
  });

  it('handles standard overlap', () => {
    const result = getOverlapArea(
      { x: 4, y: 3, width: 4, height: 4 },
      { x: 5, y: 5, width: 5, height: 5 },
    );
    expect(result).toEqual(3 * 2);
  });
});

// S -> Saturday, s -> sunday
describe('findDaysToDisplay', () => {
  it.each(
    [
      [null, 5],
      [['A~B~W13~C'], 5],
      [['A~B~S13~C'], 6],
      [['A~B~s13~C'], 7],
      [['A~B~M13~C', 'A~B~H13~C', 'A~B~T13~C', 'A~B~F13~C'], 5],
      [['A~B~S13~C', 'A~B~M13~C', 'A~B~T13~C', 'A~B~F13~C'], 6],
      [['A~B~s13~C', 'A~B~M13~C', 'A~B~T13~C', 'A~B~F13~C'], 7],
      [['A~B~S9-17,s9-17~C', 'A~B~M13~C'], 7],
    ],
  )('returns correct value', (arrayDays, expected) => {
    const result = findDaysToDisplay(arrayDays);
    expect(result).toBe(expected);
  });
});

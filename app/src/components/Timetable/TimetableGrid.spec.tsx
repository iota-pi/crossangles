import { timeToString } from './TimetableGrid';

it.each([
  [8, true, ['08', ':00']],
  [8, false, ['8', 'am']],
  [10, true, ['10', ':00']],
  [10, false, ['10', 'am']],
  [12, true, ['12', ':00']],
  [12, false, ['12', 'pm']],
  [14, true, ['14', ':00']],
  [14, false, ['2', 'pm']],
  [20, true, ['20', ':00']],
  [20, false, ['8', 'pm']],
])('timeToString(%s, %s) = %s', (hour, twentyFourHours, expected) => {
  expect(timeToString(hour, twentyFourHours)).toStrictEqual(expected);
});

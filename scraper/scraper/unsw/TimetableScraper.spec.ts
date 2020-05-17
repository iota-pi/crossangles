import { parseTimeString } from './TimetableScraper';

describe('parsing utilities', () => {
  it.each`
    times | expected
    ${''} | ${[]}
  `('parseTimeString($times) === $expected', ({ times, expected }) => {
    expect(parseTimeString(times)).toEqual(expected);
  })
})

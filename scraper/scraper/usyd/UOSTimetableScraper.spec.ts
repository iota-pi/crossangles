import { getLocation, getTime, getWeeks, mergeWeeks } from './UOSTimetableScraper';

describe('parsing utils', () => {
  it.each([
    ['Mon', '10:00-11:30', 'M10-11.5'],
    ['Tue', '10:00-11:00', 'T10'],
    ['Wed', '9:00-19:00', 'W9-19'],
    ['Thu', '9:00-9:30', 'H9-9.5'],
    ['Fri', '9:30-10:30', 'F9.5'],
  ])('getTime("%s", "%s") = "%s"', (day, time, expected) => {
    expect(getTime(day, time)).toEqual(expected);
  })

  it.each([
    ['[wks 1 to 13]', '1-13'],
    ['[wks 2 to 13]', '2-13'],
    ['[wks 1]', '1'],
    ['[wks 13]', '13'],
    ['[wks 2 to 13]Dateswk 2Thu 05 Mar 2020wk 3Thu 12 Mar 2020wk 4Thu 19 Mar 2020', '2-13'],
  ])('getWeeks("%s") = "%s"', (weeks, expected) => {
    expect(getWeeks(weeks)).toEqual(expected);
  })

  it.each([
    [['1', '2-13'], '1-13'],
    [['5-6', '1-13'], '1-13'],
    [['2-6', '7-12'], '2-12'],
    [['2-6', '8-13'], '2-6,8-13'],
    [['1', '2', '3', '7', '9', '10', '13'], '1-3,7,9-10,13'],
  ])('mergeWeeks(%s) = "%s"', (weeks, expected) => {
    expect(mergeWeeks(weeks)).toEqual(expected);
  })

  it.each([
    ['in Abercrombie Business School', 'Abercrombie Business School'],
    ['in Storie Dixson', 'Storie Dixson'],
  ])('getLocation("%s") = "%s"', (rawLocation, expected) => {
    expect(getLocation(rawLocation)).toEqual(expected);
  })
})

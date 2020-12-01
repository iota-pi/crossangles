import { parseQueryString, parseJSONQueryString, SaveAsImageData, getScreenshotHeight } from './saveAsImage';
import { getSessionManager } from './test_util';
import { ColourMap, Options } from './state';
import { getEmptySessionManagerData } from './components/Timetable/SessionManager';

const testTimetable = Object.freeze(getSessionManager().data);
const testColours: ColourMap = Object.freeze({ RING9731: 'indigo' });
const testOptions: Options = Object.freeze({
  showEnrolments: true,
  showWeeks: true,
});


export const buildQueryString = (data: object) => {
  const pairs = Object.entries(data).map(x => {
    const key = x[0];
    const value = encodeURIComponent(JSON.stringify(x[1]));
    return `${key}=${value}`;
  });
  return ((pairs.length > 0) ? '?' : '') + pairs.join('&');
}


describe('buildQueryString and parseQueryString', () => {
  it('can round trip values', () => {
    const data: SaveAsImageData = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
      options: testOptions,
    });
    const queryString = buildQueryString(data);
    const result = parseQueryString(queryString);
    expect(result).toEqual(data);
  });

  it('uses default for values missing options', () => {
    const queryString = buildQueryString({});
    expect(parseQueryString(queryString)).toEqual({
      timetable: getEmptySessionManagerData(),
      colours: {},
      options: {},
    });
  });

  it('strips out excess values', () => {
    const data: SaveAsImageData = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
      options: testOptions,
    });
    const queryString = buildQueryString({ ...data, abc: 123 } as SaveAsImageData);
    const result = parseQueryString(queryString);
    expect(result).toEqual(data);
  });
});

describe('parseGenericQueryString', () => {
  const timetable = encodeURIComponent(JSON.stringify(testTimetable.map));
  const baseQueryString = `timetable=${timetable}&single&hello=false&&&abc=undefined&undefined=null`;

  it('parses correctly with preceding question mark', () => {
    const query = `?${baseQueryString}`;
    const result = parseJSONQueryString(query);
    expect(result).toEqual({
      timetable: testTimetable.map,
      single: true,
      hello: false,
      undefined: null,
    });
  });

  it('parses correctly without preceding question mark', () => {
    const result = parseJSONQueryString(baseQueryString);
    expect(result).toEqual({
      timetable: testTimetable.map,
      single: true,
      hello: false,
      undefined: null,
    });
  });
});


describe('getScreenshotHeight', () => {
  it('gives expected result', () => {
    const timetable = getSessionManager().data;
    expect(getScreenshotHeight(timetable, true)).toBe(601);
    expect(getScreenshotHeight(timetable, false)).toBe(711);
  });
});

import { parseQueryString, parseJSONQueryString, SaveAsImageData, getScreenshotHeight } from './saveAsImage';
import { getSessionManager } from './test_util';
import { ColourMap, Options, initialState } from './state';
import { buildQueryString } from '../../image';
import { getEmptySessionManagerData } from './components/Timetable/SessionManager';

const testTimetable = Object.freeze(getSessionManager().data);
const testColours: ColourMap = Object.freeze({ RING9731: 'indigo' });
const testOptions: Options = Object.freeze({
  showEnrolments: true,
  showWeeks: true,
});


describe('buildQueryString and parseQueryString', () => {
  it('can round trip values', () => {
    const data: SaveAsImageData = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
      options: testOptions,
      twentyFourHours: false,
      darkMode: false,
      compactView: false,
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
      twentyFourHours: false,
      darkMode: false,
      compactView: false,
    });
  });

  it('strips out excess values', () => {
    const data: SaveAsImageData = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
      options: testOptions,
      twentyFourHours: false,
      darkMode: true,
      compactView: false,
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

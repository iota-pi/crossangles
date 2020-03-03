import { buildQueryString, parseQueryString, parseJSONQueryString, SaveAsImageData } from './saveAsImage';
import { getSessionManager } from './test_util';
import { ColourMap } from './state/Colours';
import { Options } from './state/Options';

const testTimetable = Object.freeze(getSessionManager().data);
const testColours: ColourMap = Object.freeze({
  RING9731: '#00796B',
});
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
    });
    const queryString = buildQueryString(data);
    const result = parseQueryString(queryString);
    expect(result).toEqual(data);
  })

  it('fails if missing timetable', () => {
    const data = Object.freeze({
      colours: testColours,
      options: testOptions,
    } as SaveAsImageData);
    const queryString = buildQueryString(data);
    expect(() => parseQueryString(queryString)).toThrow();
  })

  it('fails if missing colours', () => {
    const data = Object.freeze({
      timetable: testTimetable,
      options: testOptions,
    } as SaveAsImageData);
    const queryString = buildQueryString(data);
    expect(() => parseQueryString(queryString)).toThrow();
  })

  it('fails if missing options', () => {
    const data = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
    } as SaveAsImageData);
    const queryString = buildQueryString(data);
    expect(() => parseQueryString(queryString)).toThrow();
  })

  it('strips out excess values', () => {
    const data: SaveAsImageData = Object.freeze({
      timetable: testTimetable,
      colours: testColours,
      options: testOptions,
    });
    const queryString = buildQueryString({ ...data, abc: 123 } as SaveAsImageData);
    const result = parseQueryString(queryString);
    expect(result).toEqual(data);
  })
})

describe('parseGenericQueryString', () => {
  const timetable = encodeURIComponent(JSON.stringify(testTimetable.map));
  const baseQueryString = `timetable=${timetable}&single&hello=false&&&abc=undefined&undefined=null`

  it('parses correctly with preceding question mark', () => {
    const query = '?' + baseQueryString;
    const result = parseJSONQueryString(query);
    expect(result).toEqual({
      timetable: testTimetable.map,
      single: true,
      hello: false,
      undefined: null,
    })
  })

  it('parses correctly without preceding question mark', () => {
    const result = parseJSONQueryString(baseQueryString);
    expect(result).toEqual({
      timetable: testTimetable.map,
      single: true,
      hello: false,
      undefined: null,
    })
  })
})

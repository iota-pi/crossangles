import { getQueryString, parseQueryString, parseJSONQueryString } from './saveAsImage';
import { getSessionManager } from './test_util';

const testTimetable = Object.freeze(getSessionManager().data);


describe('getQueryString and parseQueryString', () => {
  it('can round trip values', () => {
    const queryString = getQueryString(testTimetable)
    const result = parseQueryString(queryString);
    expect(result).toEqual(testTimetable);
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

import UNSWScraper, { Parser, removeDuplicateStreams } from './UNSWScraper';
import { CourseData } from '../../src/state/Course';
import { StreamData } from '../../src/state/Stream';
import HTMLCache from './HTMLCache';

describe('UNSWScraper', () => {
  it('gives consistent results', async () => {
    // Setup
    const s = new UNSWScraper();
    s.logging = false;
    s.cache = new HTMLCache();
    const cacheFile = './unsw-snapshot.json';
    await s.cache.load(cacheFile);

    // Execute
    const data = await s.scrape();

    expect(data.courses).toMatchSnapshot();
  })
})

describe('Parser', () => {
  it.each`
    rawCode         | rawName                   | code          | name                     | term
    ${'  COMP1511'} | ${'Computing 1A (T3A)'}   | ${'COMP1511'} | ${'Computing 1A'}        | ${'T3A'}
    ${' BLAH9870 '} | ${'Thesis (Full-time)'}   | ${'BLAH9870'} | ${'Thesis (Full-time)'}  | ${undefined}
    ${'BLAH9876\t'} | ${'Hist. Foobar'}         | ${'BLAH9876'} | ${'A History of Foobar'} | ${undefined}
    ${'BLAH9876'}   | ${'Hist. Foobar  (UE2) '} | ${'BLAH9876'} | ${'A History of Foobar'} | ${'UE2'}
  `('parseCourse("$code", "$name") = "$result"', ({ rawCode, rawName, code, name, term }) => {
    const p = new Parser();
    p.courseNames = {
      BLAH9876: 'A History of Foobar',
    };

    const result = p.parseCourse(rawCode, rawName);
    expect(result).toEqual({
      code,
      name,
      term,
      streams: [],
    });
  })
})

describe('utility functions', () => {
  it('can remove duplicate streams', () => {
    const streams: StreamData[] = [
      {
        component: 'TUT',
        enrols: [8, 10],
        full: false,
        times: [{time: 'M10'}],
      },
      {
        component: 'TUT',
        enrols: [5, 10],
        full: false,
        times: [{time: 'M10'}],
      },
      {
        component: 'TUT',
        enrols: [7, 10],
        full: false,
        times: [{time: 'M10'}],
      },
      {
        component: 'LEC',
        enrols: [0, 10],
        full: false,
        times: [{time: 'M10'}],
      },
      {
        component: 'LEC',
        enrols: [0, 10],
        full: false,
        times: [{time: 'M10'}, {time: 'T12'}],
      },
    ];

    const course: CourseData = {
      code: 'TEST9999',
      name: 'Foobar',
      streams: streams.slice(),
    };
    const expected: CourseData = {
      code: 'TEST9999',
      name: 'Foobar',
      streams: [streams[1], ...streams.slice(3)],
    };
    removeDuplicateStreams(course);
    expect(course).toEqual(expected)
  })
})

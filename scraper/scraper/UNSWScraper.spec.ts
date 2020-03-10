import UNSWScraper, { Parser, removeDuplicateStreams } from './UNSWScraper';
import { CourseData } from '../../app/src/state/Course';
import { StreamData } from '../../app/src/state/Stream';
import HTMLCache from './HTMLCache';

describe('UNSWScraper', () => {
  it('gives consistent results', async () => {
    // Setup
    const s = new UNSWScraper();
    s.maxFaculties = 3;
    s.logging = false;
    s.cache = new HTMLCache();
    const cacheFile = './unsw-snapshot.json.br';
    await s.cache.load(cacheFile);

    // Execute
    const data = await s.scrape();

    // Verify
    expect(data!.courses).toMatchSnapshot();
  })

  it('skips terms with insufficient data', async () => {
    const s = new UNSWScraper();
    s.logging = false;

    const courseData: CourseData = {
      code: 'COMP9876',
      name: 'Theory of Practical Blockchain',
      streams: [{ component: 'LEC', enrols: [0, 0], times: [] }],
    };
    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [])
                            .mockImplementationOnce(async () => [courseData]);
    const result = await s.scrape();
    expect(result!.courses).toEqual([courseData]);
  })

  it('throws if no terms have sufficient data', async () => {
    const s = new UNSWScraper();
    s.logging = false;
    s.scrapeTerm = jest.fn().mockImplementation(() => []);
    await expect(s.scrape()).rejects.toThrow();
  })
})

describe('Parser', () => {
  it.each`
    rawCode         | rawName                   | code          | name                     | term
    ${'  COMP1511'} | ${'Computing 1A (T3A)'}   | ${'COMP1511'} | ${'Computing 1A'}        | ${'T3A'}
    ${' BLAH9870 '} | ${'Thesis (Full-time)'}   | ${'BLAH9870'} | ${'Thesis (Full-time)'}  | ${undefined}
    ${'BLAH9876\t'} | ${'Hist. Foobar'}         | ${'BLAH9876'} | ${'A History of Foobar'} | ${undefined}
    ${'BLAH9876'}   | ${'Hist. Foobar  (UE2) '} | ${'BLAH9876'} | ${'A History of Foobar'} | ${'UE2'}
  `('parseCourse("$code", "$name") give term "$term"', ({ rawCode, rawName, code, name, term }) => {
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

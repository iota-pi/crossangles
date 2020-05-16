import ClassUtilScraper, { Parser, removeDuplicateStreams } from './ClassUtilScraper';
import HTMLCache from '../HTMLCache';
import { CourseData, StreamData } from '../../../app/src/state';
import StateManager from '../../state/StateManager';

const mockStateManager: StateManager = {
  get: jest.fn(),
  set: jest.fn(),
} as any;

describe('UNSWScraper', () => {
  let s: ClassUtilScraper;

  beforeEach(async () => {
    s = await ClassUtilScraper.create({ state: mockStateManager });
  });

  const courseData: CourseData = {
    code: 'COMP9876',
    name: 'Theory of Practical Blockchain',
    streams: [{ component: 'LEC', enrols: [0, 0], times: [] }],
  };

  it('gives consistent results', async () => {
    // Setup
    s.maxFaculties = 3;
    s.cache = new HTMLCache();
    const cacheFile = './unsw-snapshot.json.br';
    await s.cache.load(cacheFile);

    // Execute
    const data = await s.scrape();

    // Verify
    const courseData = data?.map(t => t.courses);
    expect(courseData).toMatchSnapshot();
  })

  it('returns terms in ascending order', async () => {
    s.scrapeTerm = jest.fn().mockImplementation(() => []);
    const result = await s.scrape();
    expect(result?.map(r => r.meta.term)).toEqual([1, 2, 3]);
  })

  it('picks latest term with sufficient data as current term', async () => {
    s.scrapeTerm = jest.fn().mockImplementation(async () => [courseData])
    const result = await s.scrape();
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([false, false, true]);
  })

  it('skips terms with insufficient data', async () => {
    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [])
                            .mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => []);
    const result = await s.scrape();
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([false, true, false]);
  })

  it('can correctly pick first term as current term', async () => {
    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => [])
                            .mockImplementationOnce(async () => []);
    const result = await s.scrape();
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([true, false, false]);
  })

  it('gives empty results when no data is found', async () => {
    s.scrapeTerm = jest.fn().mockImplementation(() => []);
    const result = await s.scrape();
    expect(result?.map(r => r.campus)).toEqual(['unsw', 'unsw', 'unsw']);
    expect(result?.map(r => r.courses)).toEqual([[], [], []]);
    expect(result?.map(r => r.current)).toEqual([false, false, false]);
  })
})

describe('Parser', () => {
  it.each`
    rawCode       | rawName                  | code          | name                     | term
    ${'COMP1511'} | ${'Computing 1A (T3A)'}  | ${'COMP1511'} | ${'Computing 1A'}        | ${'T3A'}
    ${'BLAH9870'} | ${'Thesis (Full-time)'}  | ${'BLAH9870'} | ${'Thesis (Full-time)'}  | ${undefined}
    ${'BLAH9876'} | ${'Hist. Foobar'}        | ${'BLAH9876'} | ${'A History of Foobar'} | ${undefined}
    ${'BLAH9876'} | ${'Hist. Foobar  (UE2)'} | ${'BLAH9876'} | ${'A History of Foobar'} | ${'UE2'}
  `('parseCourse("$code", "$name")"', ({ rawCode, rawName, code, name, term }) => {
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

  it.each`
    name                     | term
    ${'Computing 1A (T3A)'}  | ${'T3A'}
    ${'Hist. Foobar  (UE2)'} | ${'UE2'}
    ${'Computing 1A'}        | ${undefined}
    ${'Thesis (Full-time)'}  | ${undefined}
  `('extractTerm($name) = $term', ({ name, term }) => {
    const p = new Parser();
    expect(p.extractTerm(name)).toBe(term);
  })

  it.each`
    raw | parsed
    ${'Wed 09-11# (w1-5,7-10, Online)'}
      | ${[{"canClash": true, "location": "Online", "time": "W9-11", "weeks": "1-5,7-10"}]}
    ${'Tue 09-10:30 (w11, Webst 252); Fri 09-10:30 (w2-5,7,9-10, Webst 252)'}
      | ${[{"location": "Webst 252", "time": "F9-10.5", "weeks": "2-5,7,9-10"}]}
    ${'Thu 14-16 (w1-5,7-10, AinswthG03)'}
      | ${[{"location": "AinswthG03", "time": "H14-16", "weeks": "1-5,7-10"}]}
    ${'Tue 10-11:30 (w11, Gold G02); Fri 10-11:30 (w1-7,9-10, Gold G01)'}
      | ${[{"location": "Gold G01", "time": "F10-11.5", "weeks": "1-7,9-10"}]}
    ${'Thu 19-21 (w6, See School)'}
      | ${[{"time": "H19-21", "weeks": "6"}]}
    ${'Wed 09-10:30 (w1-10)'}
      | ${[{"time": "W9-10.5", "weeks": "1-10"}]}
    ${'Wed 19-21 (w1-5,7-N2, MathewsThA) Comb/w COMP6841-UGRD'}
      | ${[{"location": "MathewsThA", "time": "W19-21", "weeks": "1-5,7-N2"}]}
    ${'Mon 8-20 (w< 1,N1,N2, MathewsThA)'} | ${[]}
    ${'Fri 8-20 (w< 1)'} | ${[]}
    ${'Mon-Fri 8-20 (w<1, See School)'} | ${[]}
    ${'Mon-Fri 8-20 (w1)'} | ${[]}
    ${'Tue-Thu 10-15 (w3-5, AinswthG03)'} | ${[]}
    ${'Mon 8-20 (wN1)'} | ${[]}
    ${'Sat 9-12 (w1-6,7-10)'} | ${[]}
    ${'Sun 9-12 (w1-10, See School)'} | ${[]}
  `('getWeeks($raw) = $parsed', ({ raw, parsed }) => {
    const p = new Parser();
    expect(p.parseTimeStr(raw)).toEqual(parsed);
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

import UNSWScraper, { Parser, removeDuplicateStreams } from './UNSWScraper';
import { CourseData } from '../../app/src/state/Course';
import { StreamData } from '../../app/src/state/Stream';
import HTMLCache from './HTMLCache';
import { cleanStateManager } from '../state/getStateManager';
import StateManager from '../state/StateManager';

const mockStateManager: StateManager = {
  get: jest.fn(),
  set: jest.fn(),
} as any;

describe('UNSWScraper', () => {
  beforeEach(async () => {
    cleanStateManager();
  })

  const courseData: CourseData = {
    code: 'COMP9876',
    name: 'Theory of Practical Blockchain',
    streams: [{ component: 'LEC', enrols: [0, 0], times: [] }],
  };

  it('gives consistent results', async () => {
    // Setup
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.maxFaculties = 3;
    s.logging = false;
    s.cache = new HTMLCache();
    const cacheFile = './unsw-snapshot.json.br';
    await s.cache.load(cacheFile);

    // Execute
    const data = await s.scrape();

    // Verify
    const courseData = data?.map(t => t.courses);
    expect(courseData).toMatchSnapshot();
  })

  it('skips terms with insufficient data', async () => {
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.logging = false;

    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [])
                            .mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => []);
    const result = await s.scrape();
    const resultTerm = result?.map(t => t.meta.term);
    expect(resultTerm).toEqual([1, 2, 3]);
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([false, true, false]);
  })

  it('picks latest term with sufficient data as current term', async () => {
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.logging = false;

    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => [courseData]);
    const result = await s.scrape();
    const resultTerm = result?.map(t => t.meta.term);
    expect(resultTerm).toEqual([1, 2, 3]);
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([false, false, true]);
  })

  it('can correctly pick first term as current term', async () => {
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.logging = false;

    s.scrapeTerm = jest.fn().mockImplementationOnce(async () => [courseData])
                            .mockImplementationOnce(async () => [])
                            .mockImplementationOnce(async () => []);
    const result = await s.scrape();
    const resultTerm = result?.map(t => t.meta.term);
    expect(resultTerm).toEqual([1, 2, 3]);
    const resultCurrent = result?.map(t => t.current);
    expect(resultCurrent).toEqual([true, false, false]);
  })

  it('gives empty results when no data is found', async () => {
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.logging = false;
    s.scrapeTerm = jest.fn().mockImplementation(() => []);
    const result = await s.scrape();
    expect(result?.map(r => r.campus)).toEqual(['unsw', 'unsw', 'unsw']);
    expect(result?.map(r => r.courses)).toEqual([[], [], []]);
    expect(result?.map(r => r.current)).toEqual([false, false, false]);
  })

  it('gives expected term results', async () => {
    const s = await UNSWScraper.create({ state: mockStateManager });
    s.logging = false;
    s.scrapeTerm = jest.fn().mockImplementation(() => []);
    const result = await s.scrape();
    expect(result?.map(r => r.meta.term)).toEqual([1, 2, 3]);
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

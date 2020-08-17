import { ClassUtilScraper } from './ClassUtilScraper';
import { CourseData } from '../../../app/src/state/Course';
import { StreamData } from '../../../app/src/state/Stream';
import { removeDuplicateStreams } from './commonUtils';


describe('ClassUtilScraper', () => {
  it('checkTerm', () => {
    const c = new ClassUtilScraper();
    c.checkTerm(1);
    c.checkTerm(2);
    c.checkTerm(3);
    expect(() => c.checkTerm(-1)).toThrow();
    expect(() => c.checkTerm(0)).toThrow();
    expect(() => c.checkTerm(4)).toThrow();
    expect(() => c.checkTerm(5)).toThrow();
  });
});

describe('utility functions', () => {
  it('can remove duplicate streams', () => {
    const streams: StreamData[] = [
      {
        component: 'TUT',
        enrols: [8, 10],
        full: false,
        times: [{ time: 'M10' }],
      },
      {
        component: 'TUT',
        enrols: [5, 10],
        full: false,
        times: [{ time: 'M10' }],
      },
      {
        component: 'TUT',
        enrols: [7, 10],
        full: false,
        times: [{ time: 'M10' }],
      },
      {
        component: 'LEC',
        enrols: [0, 10],
        full: false,
        times: [{ time: 'M10' }],
      },
      {
        component: 'LEC',
        enrols: [0, 10],
        full: false,
        times: [{ time: 'M10' }, { time: 'T12' }],
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
    expect(course).toEqual(expected);
  });
});

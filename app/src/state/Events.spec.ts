import { getAutoSelectedEvents, getEvents } from './Events';
import { CourseMap, CourseId, CourseData } from './Course';
import { ClassTime } from './Stream';


describe('getEvents', () => {
  const baseCourse: CourseData = {
    code: 'code',
    name: '',
    streams: [
      { component: 'a', enrols: [0, 0], times: [] },
      { component: 'b', enrols: [0, 0], times: [] },
    ],
  };

  it('gets events from additional course', () => {
    const course: CourseData = { ...baseCourse, isAdditional: true };
    const result = getEvents(course);
    expect(result).toEqual([
      { id: 'code~a', name: 'a' },
      { id: 'code~b', name: 'b' },
    ]);
  })

  it('gives no events for non-additional courses', () => {
    expect(getEvents(baseCourse)).toEqual([]);
    expect(getEvents({ ...baseCourse, isAdditional: false })).toEqual([]);
  })

  it('doesn\'t give duplicate events', () => {
    const course: CourseData = {
      code: 'code',
      name: '',
      isAdditional: true,
      streams: [
        { component: 'a', enrols: [0, 0], times: [] },
        { component: 'a', enrols: [0, 0], times: [] },
      ],
    };
    const result = getEvents(course);
    expect(result).toEqual([
      { id: 'code~a', name: 'a' },
    ]);
  })
})

describe('getAutoSelectedEvents', () => {
  it('gets events from auto-selected courses', () => {
    const enrols: [number, number] = [0, 0];
    const times: ClassTime[] = [];
    const courseMap: CourseMap = {
      a: {
        code: 'a',
        name: '',
        isAdditional: true,
        autoSelect: true,
        streams: [
          { component: 'a', enrols, times },
          { component: 'b', enrols, times },
        ],
      },
      b: {
        code: 'b',
        name: '',
        autoSelect: true,
        streams: [
          { component: 'c', enrols, times },
        ],
      },
      d: {
        code: 'd',
        name: '',
        isAdditional: true,
        streams: [
          { component: 'd', enrols, times },
        ],
      },
    };
    const additional: CourseId[] = ['a', 'd'];
    const result = getAutoSelectedEvents(courseMap, additional);
    expect(result).toEqual([
      { id: 'a~a', name: 'a'},
      { id: 'a~b', name: 'b'},
    ]);
  })
})
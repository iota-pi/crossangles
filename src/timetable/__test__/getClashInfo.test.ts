import { CourseData, Course, Stream } from '../../state';
import coursesData from '../../../public/data-mini.json';
import { getClashInfo } from '../getClashInfo';
import coursesToComponents from '../coursesToComponents';

function shuffleArray<T> (array: T[]): T[] {
  for (let i = array.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[j];
    array[j] = array[i];
    array[i] = temp;
  }
  return array;
}

describe('getClashInfo', () => {
  it('gives consistent result', () => {
    const courses = (coursesData.courses as CourseData[]).map(data => new Course(data));
    const components = coursesToComponents(courses, [], false);
    const allStreams = ([] as Stream[]).concat(...components.map(c => c.streams));
    const clashInfo = getClashInfo(allStreams);
    expect(clashInfo).toMatchSnapshot();
  });

  it('isn\'t affected by course order', () => {
    const courses = (coursesData.courses as CourseData[]).map(data => new Course(data));
    const components = coursesToComponents(courses, [], false);

    const allStreams = ([] as Stream[]).concat(...components.map(c => c.streams));
    const clashInfo = getClashInfo(allStreams);

    shuffleArray(components);

    const allStreams2 = ([] as Stream[]).concat(...components.map(c => c.streams));
    const clashInfo2 = getClashInfo(allStreams2);

    expect(clashInfo).toEqual(clashInfo2);
  });

  it('correctly handles components with only full streams', () => {
    const course = new Course({
      name: '',
      code: '',
      streams: [],
    });
    course.streams = [
      new Stream({ component: 'LEC', course, enrols: [0, 1], full: false, times: [{ time: 'M9-10' }] }),
      new Stream({ component: 'LEC', course, enrols: [0, 1], full: true, times: [{ time: 'T9-10' }] }),
      new Stream({ component: 'TUT', course, enrols: [0, 1], full: true, times: [{ time: 'T10-11' }] }),
      new Stream({ component: 'TUT', course, enrols: [0, 1], full: true, times: [{ time: 'W9-10' }] }),
      new Stream({ component: 'TUT', course, enrols: [0, 1], full: true, times: [{ time: 'H9-10' }] }),
      new Stream({ component: 'TUT', course, enrols: [0, 1], full: true, times: [{ time: 'F9-10' }] }),
    ];

    const components = coursesToComponents([ course ], [], false);
    const allStreams = ([] as Stream[]).concat(...components.map(c => c.streams));
    const clashInfo = getClashInfo(allStreams);

    expect(clashInfo).toMatchSnapshot();
  });
});

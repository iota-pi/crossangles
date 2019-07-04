import { CourseData, Course, Stream } from '../../state';
import coursesData from '../../../public/data-mini.json';
import coursesToComponents from '../coursesToComponents';

describe('coursesToComponents', () => {
  it('gives consistent result', () => {
    const courses = (coursesData.courses as CourseData[]).map(data => new Course(data));
    const components = coursesToComponents(courses, [], false);
    expect(components).toMatchSnapshot();

    const componentsFull = coursesToComponents(courses, [], true);
    expect(componentsFull).toMatchSnapshot();
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

    expect(components).toMatchSnapshot();
    expect(components.length).toBe(2);
    expect(components[0].name).toBe('LEC');
    expect(components[1].name).toBe('TUT');
    expect(components[0].streams.length).toBe(1);
    expect(components[1].streams.length).toBe(0);
  });
});

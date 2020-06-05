import { getCourseId, hasWebStream, CourseData, getWebStream, getComponents } from './Course';
import { StreamData } from './Stream';

const code = 'TPBC1234';
const name = 'Theory of Practical Blockchain';
describe('course state util functions', () => {
  it('gets correct course id', () => {
    const course: CourseData = { code, name, streams: [], term: 'T1A' };
    const result = getCourseId(course);
    expect(result).toBe('TPBC1234T1A');
  })

  it('detects a web stream at the start', () => {
    const streams: StreamData[] = [
      { component: 'LEC', enrols: [ 0,   0], times: [], web: true },
      { component: 'LEC', enrols: [10,  10], times: [], full: true },
      { component: 'LEC', enrols: [ 1, 100], times: [], full: false },
    ];
    const course: CourseData = { code, name, streams };
    const result = hasWebStream(course);
    expect(result).toBe(true);
    expect(getWebStream(course)).toBe(streams[0]);
  })

  it('detects a web stream at the end', () => {
    const streams: StreamData[] = [
      { component: 'LEC', enrols: [ 0,   0], times: [] },
      { component: 'LEC', enrols: [10,  10], times: [], full: true },
      { component: 'LEC', enrols: [ 1, 100], times: [], full: false, web: true },
    ];
    const course: CourseData = { code, name, streams };
    const result = hasWebStream(course);
    expect(result).toBe(true);
    expect(getWebStream(course)).toBe(streams[2]);
  })

  it('detects a web stream in the middle', () => {
    const streams: StreamData[] = [
      { component: 'LEC', enrols: [ 0,   0], times: [] },
      { component: 'LEC', enrols: [10,  10], times: [], full: true, web: true },
      { component: 'LEC', enrols: [ 1, 100], times: [], full: false },
    ];
    const course: CourseData = { code, name, streams };
    const result = hasWebStream(course);
    expect(result).toBe(true);
    expect(getWebStream(course)).toBe(streams[1]);
  })

  it('detects a web stream on tutorials', () => {
    const streams: StreamData[] = [
      { component: 'TUT', enrols: [10,  10], times: [], full: true, web: true },
    ];
    const course: CourseData = { code, name, streams };
    const result = hasWebStream(course);
    expect(result).toBe(true);
    expect(getWebStream(course)).toBe(streams[0]);
  })

  it('detects no web stream', () => {
    const streams: StreamData[] = [
      { component: 'LEC', enrols: [0,  10], times: [] },
    ];
    const course: CourseData = { code, name, streams };
    const result = hasWebStream(course);
    expect(result).toBe(false);
    expect(getWebStream(course)).toBe(null);
  })

  it('doesn\'t give duplicate components', () => {
    const streams: StreamData[] = [
      { component: 'LEC', enrols: [ 0,   0], times: [] },
      { component: 'LEC', enrols: [10,  10], times: [], full: true },
      { component: 'LEC', enrols: [ 1, 100], times: [], full: false, web: true },
    ];
    const course: CourseData = { code, name, streams };
    const result = getComponents(course);
    expect(result).toEqual(['LEC']);
  })

  it('gives correct components', () => {
    const streams: StreamData[] = [
      { component: 'OTH', enrols: [ 0,   0], times: [] },
      { component: 'TUT', enrols: [10,  10], times: [], full: true },
      { component: 'LEC', enrols: [ 1, 100], times: [], full: false, web: true },
    ];
    const course: CourseData = { code, name, streams };
    const result = getComponents(course);
    expect(result).toEqual(['OTH', 'TUT', 'LEC']);
  })
})

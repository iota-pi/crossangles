import { getCourseId, hasWebStream, CourseData, getWebStream, getComponents, Career, getClarificationText } from './Course';
import { StreamData } from './Stream';
import { getCourse } from '../test_util';

const code = 'TPBC1234';
const name = 'Theory of Practical Blockchain';
describe('course state util functions', () => {
  it.each`
    term         | section      | career         | expected
    ${undefined} | ${undefined} | ${undefined}   | ${'TPBC1234'}
    ${'T1A'}     | ${undefined} | ${undefined}   | ${'TPBC1234~T1A'}
    ${undefined} | ${'CR01'}    | ${undefined}   | ${'TPBC1234~CR01'}
    ${undefined} | ${undefined} | ${Career.PGRD} | ${'TPBC1234~PGRD'}
    ${undefined} | ${undefined} | ${Career.UGRD} | ${'TPBC1234'}
    ${'T1A'}     | ${'CR01'}    | ${Career.PGRD} | ${'TPBC1234~T1A~CR01~PGRD'}
  `('gets correct course id', ({ term, section, career, expected }) => {
    const course: CourseData = { code, name, streams: [], term, section, career };
    const result = getCourseId(course);
    expect(result).toBe(expected);
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

  it.each`
    career         | section      | term         | description                      | expected
    ${Career.UGRD} | ${'CR01'}    | ${undefined} | ${'AVAIlable only to MECH/SENG'} | ${'CR01; MECH, SENG'}
    ${Career.PGRD} | ${'CR02'}    | ${'T2A'}     | ${'AVAIlable only to MECH/SENG'} | ${'CR02; T2A; MECH, SENG; Postgrad'}
    ${undefined}   | ${undefined} | ${undefined} | ${'MECH/AERO/MTRN programs'}     | ${'MECH, AERO, MTRN'}
  `('gets correct clarification text', ({ career, section, term, description, expected }) => {
    const course: CourseData = {
      ...getCourse(),
      career,
      section,
      term,
      description,
    };
    const result = getClarificationText(course);
    expect(result).toEqual(expected);
  })
})

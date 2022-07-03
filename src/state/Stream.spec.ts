import { getStreamId, getSessions, StreamData, linkStream, getComponentName, closestMonday, parseBackwardsDateString } from './Stream';
import { getCourse } from '../test_util';
import { CourseData, getCourseId } from './Course';
import { SessionData } from './Session';


describe('getStreamId', () => {
  it('returns expected value', () => {
    const course = getCourse();
    const stream = course.streams[0];
    expect(getStreamId(course, stream)).toBe('RING9731~LEC~M9,H12,T12');
  });
});

describe('getSessions', () => {
  it.each([
    true, false,
  ])('returns empty list for stream with no times (web=$web)', web => {
    const stream: StreamData = { component: 'LEC', enrols: [0, 0], times: [], web };
    const course: CourseData = {
      ...getCourse(),
      streams: [stream],
    };
    expect(getSessions(course, stream)).toEqual([]);
  });

  it('gives expected result', () => {
    const stream: StreamData = {
      component: 'LEC',
      enrols: [0, 0],
      times: [{ time: 'M10-20', location: 'foo' }, { time: 'T15', weeks: 'bar' }, { time: 'H8' }],
    };
    const course: CourseData = {
      ...getCourse(),
      streams: [stream],
    };
    const courseId = getCourseId(course);
    const streamId = getStreamId(course, stream);
    const common: Omit<SessionData, 'index' | 'day' | 'start' | 'end'> = {
      course: courseId,
      stream: streamId,
      canClash: undefined,
      weeks: undefined,
      location: undefined,
    };
    const expected: SessionData[] = [
      { ...common, index: 0, day: 'M', start: 10, end: 20, location: 'foo' },
      { ...common, index: 1, day: 'T', start: 15, end: 16, weeks: 'bar' },
      { ...common, index: 2, day: 'H', start: 8, end: 9 },
    ];
    expect(getSessions(course, stream)).toEqual(expected);
  });
});


describe('linkStream', () => {
  it('gives consistent output', () => {
    const course = getCourse();
    for (const stream of course.streams) {
      expect(linkStream(course, stream)).toMatchSnapshot();
    }
  });
});


it.each([
  ['TUT', 'Tutorial'],
  ['LEC', 'Lecture'],
  ['LE1', 'Lecture (1)'],
  ['QQQ', 'QQQ'],
])('getComponentName("%s") = "%s"', (code, name) => {
  expect(getComponentName({ component: code })).toEqual(name);
});


it.each([
  ['04/07/2022', new Date(2022, 6, 4)],
  ['1/2/2023', new Date(2023, 1, 1)],
])('parseBackwardsDateString(%s) = %s', (input, output) => {
  expect(parseBackwardsDateString(input)).toEqual(output);
});


it.each([
  [new Date(2022, 6, 3), new Date(2022, 6, 4)],
  [new Date(2022, 6, 4), new Date(2022, 6, 4)],
  [new Date(2022, 6, 5), new Date(2022, 6, 4)],
  [new Date(2022, 6, 8), new Date(2022, 6, 4)],
  [new Date(2022, 6, 9), new Date(2022, 6, 11)],
  [new Date(2022, 6, 10), new Date(2022, 6, 11)],
])('closestMonday(%s) = %s', (input, output) => {
  expect(closestMonday(input)).toEqual(output);
});

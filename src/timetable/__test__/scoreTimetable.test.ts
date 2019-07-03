import { scoreFreeDays, scoreTimes, scoreDayLength, scoreUnchanged, scoreClashes, countClashes } from '../scoreTimetable';
import { Session, CourseData, Course, Stream, StreamData, CommonSession } from '../../state';
import coursesData from '../../../public/data-mini.json';
import { getClashInfo } from '../getClashInfo';
import coursesToComponents from '../coursesToComponents';

describe('scoreFreeDays', () => {
  it('gives correct value', () => {
    expect(scoreFreeDays([
      { day: 'M', start: 10, end: 12 },
      { day: 'M', start: 10, end: 12 },
    ])).toBe(250 + 280 + 260 + 300);

    expect(scoreFreeDays([
      { day: 'M', start: 10, end: 13 },
      { day: 'F', start: 11, end: 12 },
    ])).toBe(250 + 280 + 260);

    expect(scoreFreeDays([
      { day: 'T', start: 10, end: 13 },
      { day: 'W', start: 11, end: 12 },
    ])).toBe(290 + 260 + 300);

    expect(scoreFreeDays([
      { day: 'M', start: 11, end: 12 },
      { day: 'T', start: 11, end: 12 },
      { day: 'W', start: 11, end: 12 },
      { day: 'H', start: 11, end: 12 },
      { day: 'F', start: 11, end: 12 },
    ])).toBe(0);
  });
});

describe('scoreTimes', () => {
  it('gives correct value', () => {
    expect(scoreTimes([])).toBe(0);

    expect(scoreTimes([
      { day: 'M', start: 12, end: 14 },
    ])).toBe(0);

    expect(scoreTimes([
      { day: 'M', start: 10, end: 12 },
      { day: 'M', start: 12, end: 14 },
    ])).toBe(-7 + 0);

    expect(scoreTimes([
      { day: 'T', start: 10, end: 12 },
      { day: 'W', start: 12, end: 14 },
      { day: 'H', start: 12, end: 14 },
      { day: 'F', start: 12, end: 14 },
    ])).toBe(-7 + 0 + 0 + 0);

    expect(scoreTimes([
      { day: 'M', start: 9, end: 10 },
      { day: 'F', start: 17, end: 20 },
    ])).toBe(-16 + -27);
  });
});

describe('scoreDayLength', () => {
  it('gives correct value', () => {
    expect(scoreDayLength([])).toBe(-0);

    expect(scoreDayLength([
      { day: 'M', start: 12, end: 14 },
    ])).toBe(-20);

    expect(scoreDayLength([
      { day: 'M', start: 10, end: 12 },
      { day: 'M', start: 12, end: 14 },
    ])).toBe(-40);

    expect(scoreDayLength([
      { day: 'T', start: 10, end: 12 },
      { day: 'W', start: 12, end: 14 },
      { day: 'H', start: 12, end: 14 },
      { day: 'F', start: 12, end: 14 },
    ])).toBe(-20 * 4);

    expect(scoreDayLength([
      { day: 'M', start: 9, end: 10 },
      { day: 'M', start: 17, end: 20 },
    ])).toBe(-110);
  });
});

describe('scoreUnchanged', () => {
  it('gives correct value', () => {
    const sessions: CommonSession[] = [
      { day: 'M', start: 10, end: 14 },
      { day: 'T', start: 10, end: 14 },
      { day: 'W', start: 10, end: 14 },
      { day: 'H', start: 9, end: 12 },
    ];
    const previous = new Set(sessions);

    expect(scoreUnchanged([], previous)).toBe(0);
    expect(scoreUnchanged(sessions, previous)).toBe(30 * sessions.length);

    expect(scoreUnchanged([sessions[0]], previous)).toBe(30);
    expect(scoreUnchanged([sessions[1]], previous)).toBe(30);
    expect(scoreUnchanged(sessions.slice(0, 2), previous)).toBe(60);
    expect(scoreUnchanged(sessions.slice(0, 2).concat([
      { day: 'H', start: 9, end: 12 },
    ]), previous)).toBe(60);
  });
});

describe('scoreClashes and countClashes', () => {
  it('gives correct count (synthetic data)', () => {
    const course = new Course({ name: '', code: '', streams: [] });
    const mockData = { component: '', full: false, enrols: [0, 0] as [number, number], course };
    const streams: Stream[] = [
      new Stream({ ...mockData, times: [{ time: 'M9-10' }] }),
      new Stream({ ...mockData, times: [{ time: 'T9-10' }, { time: 'M10-12' }] }),
      new Stream({ ...mockData, times: [{ time: 'M9-11' }] }),
    ];
    const clashInfo = getClashInfo(streams);

    expect(countClashes([], clashInfo, 100)).toBe(0);

    expect(countClashes([streams[0]], clashInfo, 100)).toBe(0);
    expect(countClashes([streams[1]], clashInfo, 100)).toBe(0);
    expect(countClashes([streams[2]], clashInfo, 100)).toBe(0);

    expect(countClashes([streams[0], streams[1]], clashInfo, 100)).toBe(0);
    expect(countClashes([streams[1], streams[0]], clashInfo, 100)).toBe(0);

    expect(countClashes([streams[0], streams[2]], clashInfo, 100)).toBe(1);
    expect(countClashes([streams[2], streams[0]], clashInfo, 100)).toBe(1);

    expect(countClashes([streams[1], streams[2]], clashInfo, 100)).toBe(1);
    expect(countClashes([streams[2], streams[1]], clashInfo, 100)).toBe(1);

    expect(countClashes(streams, clashInfo, 100)).toBe(2);
  });

  it('can be limited (genuine dataset)', () => {
    const courses = (coursesData.courses as CourseData[]).map(data => new Course(data));
    const components = coursesToComponents(courses, [], false);
    const allStreams = ([] as Stream[]).concat(...components.map(c => c.streams));
    const clashInfo = getClashInfo(allStreams);

    expect(countClashes(allStreams, clashInfo, 100)).toBe(17);
    expect(countClashes(allStreams, clashInfo, 0)).toBe(1);
    expect(countClashes(allStreams, clashInfo, 5)).toBe(6);
  });

  it('gives correct score', () => {
    expect(scoreClashes(0)).toBe(-0);
    expect(scoreClashes(1)).toBe(-1000);
    expect(scoreClashes(5.5)).toBe(-5500);
  });
});

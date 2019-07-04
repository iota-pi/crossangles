import { getClashInfo, streamClashLength, sessionClashLength } from '../getClashInfo';
import { Stream, Course, CBSEvent, CourseData } from '../../state';
import cbs from '../../assets/cbs.json';

describe('sessionClashLength', () => {
  it('gives correct value', () => {
    expect(sessionClashLength(
      { day: 'M', start: 10, end: 12 },
      { day: 'M', start: 10, end: 12 },
    )).toBe(2);
    expect(sessionClashLength(
      { day: 'T', start: 10, end: 12 },
      { day: 'T', start: 10, end: 15 },
    )).toBe(2);
    expect(sessionClashLength(
      { day: 'W', start: 13, end: 15 },
      { day: 'W', start: 0, end: 14 },
    )).toBe(1);
    expect(sessionClashLength(
      { day: 'H', start: 10, end: 13 },
      { day: 'H', start: 11, end: 12 },
    )).toBe(1);

    expect(sessionClashLength(
      { day: 'M', start: 10, end: 13 },
      { day: 'F', start: 11, end: 12 },
    )).toBe(0);

    expect(sessionClashLength(
      { day: 'T', start: 11, end: 12 },
      { day: 'W', start: 10, end: 13 },
    )).toBe(0);

    expect(sessionClashLength(
      { day: 'H', start: 14, end: 15 },
      { day: 'H', start: 12, end: 14 },
    )).toBe(0);
    expect(sessionClashLength(
      { day: 'F', start: 16, end: 24 },
      { day: 'F', start: 12, end: 13 },
    )).toBe(0);
  })
});

describe('streamClashLength', () => {
  it('gives correct value', () => {
    const course = new Course({ code: '', name: '', streams: [] })
    const dummyData = { component: '', enrols: [0, 1] as [number, number], full: false, course };
    expect(streamClashLength(
      new Stream({
        ...dummyData,
        times: [{ time: 'M10-12' }, { time: 'T10-12'}, { time: 'W10-12' }],
      }),
      new Stream({
        ...dummyData,
        times: [{ time: 'M11-12' }, { time: 'T9-10'}, { time: 'W10-12' }, { time: 'H10-12' }],
      }),
    )).toBe(3);
  })
});

describe('getClashInfo', () => {
  it('gives correct value', () => {
    const courses = [
      new Course({
        code: "ACCT1501",
        name: "Accounting and Financial Management 1A",
        streams: [
          { component: "LEC", enrols: [323,330], times: [{ time: "W13-15", location: "Science Th" }], full: false, web: false},
          { component: "LEC", enrols: [183,190], times: [{ time: "H9-11", location: "ChemSc M18" }], full: false, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "F10.5-12", location: "BUS 114" }], full: true, web: false},
          { component: "TUT", enrols: [23,26], times: [{ time: "H9-10.5", location: "Gold G01" }], full: false, web: false},
          { component: "TUT", enrols: [24,26], times: [{ time: "H10.5-12", location: "Gold G01" }], full: false, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "H12-13.5", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "H13.5-15", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "H15-16.5", location: "BUS 215" }], full: true, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "H16.5-18", location: "BUS 215" }], full: true, web: false},
          { component: "TUT", enrols: [23,26], times: [{ time: "T9-10.5", location: "BUS 215" }], full: false, web: false},
          { component: "TUT", enrols: [27,26], times: [{ time: "T10.5-12", location: "BUS 215" }], full: true, web: false},
          { component: "TUT", enrols: [24,26], times: [{ time: "T12-13.5", location: "BUS 207" }], full: false, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "T13.5-15", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "T15-16.5", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [25,26], times: [{ time: "T16.5-18", location: "BUS 207" }], full: false, web: false},
          { component: "TUT", enrols: [25,26], times: [{ time: "T18-19.5", location: "BUS 118" }], full: false, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "W9-10.5", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [26,26], times: [{ time: "W10.5-12", location: "BUS 207" }], full: true, web: false},
          { component: "TUT", enrols: [24,26], times: [{ time: "W15-16.5", location: "BUS 215" }], full: false, web: false},
          { component: "TUT", enrols: [25,26], times: [{ time: "W16.5-18", location: "Sqhouse206" }], full: false, web: false },
        ],
        term: null,
        useWebStream: false,
      }),
      new Course(cbs as CourseData),
    ];
    const events: CBSEvent[] = ['The Bible Talks', 'Bible Study'];
    const allStreams = courses.reduce((all, c) => all.concat(c.streams), [] as Stream[]);
    const clashInfo = getClashInfo(allStreams);
    expect(clashInfo.get(courses[0].streams[0])!.get(courses[1].streams[10])).toBe(0);
    expect(clashInfo.get(courses[0].streams[0])!.get(courses[1].streams[11])).toBe(1);
    expect(clashInfo.get(courses[0].streams[1])!.get(courses[1].streams[11])).toBe(0);
    expect(clashInfo.get(courses[0].streams[1])!.get(courses[1].streams[12])).toBe(0);
  })
});

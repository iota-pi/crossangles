/* eslint-disable quote-props */
import { DeliveryType } from '../../../app/src/state/Stream';
import {
  abbreviateDay,
  getComponent,
  getDelivery,
  getIsWeb,
  getIsFull,
  getShortActivity,
  getTermNumber,
  isIntensive,
  isOnWeekend,
  shortenTime,
  shouldSkipStream,
  splitLocation,
  StreamTableData,
  weeksAreOutsideTerm,
} from './TimetableScraper';

const baseStreamTableData: StreamTableData = {
  'Activity': 'Lecture',
  'Census Date': '15/03/2020',
  'Class Nbr': '8765',
  'Class Notes': '',
  'Enrols/Capacity': '326/352',
  'Mode of Delivery': 'In Person',
  'Meeting Dates': 'Standard dates',
  'Meeting Information': '',
  'Offering Period': '17/02/2020 - 17/05/2020',
  'Teaching Period': 'T1 - Teaching Period One',
  'Consent': 'Consent not required',
  'Section': 'A',
  'Status': 'Open',
};

describe('parsing utilities', () => {
  it('shouldSkipStream() = false', () => {
    const data: StreamTableData[] = [
      {
        ...baseStreamTableData,
      },
      {
        ...baseStreamTableData,
        'Status': 'Full',
      },
      {
        ...baseStreamTableData,
        'Enrols/Capacity': '0/1',
      },
    ];
    const results = data.filter(x => !shouldSkipStream(x));
    expect(results.length).toBe(data.length);
  });

  it('shouldSkipStream() = true', () => {
    const data: StreamTableData[] = [
      {
        ...baseStreamTableData,
        'Status': 'Cancelled',
      },
      {
        ...baseStreamTableData,
        'Status': 'Stop',
      },
      {
        ...baseStreamTableData,
        'Enrols/Capacity': '0/0',
      },
      {
        ...baseStreamTableData,
        'Enrols/Capacity': '1/0',
      },
    ];
    const results = data.filter(x => !shouldSkipStream(x));
    expect(results.length).toBe(0);
  });

  it.each`
    time         | expected
    ${'11'}      | ${true}
    ${'1,11'}    | ${false}
    ${'1-11'}    | ${false}
    ${'1'}       | ${false}
    ${'5'}       | ${false}
    ${'< 1'}     | ${true}
    ${'N1'}      | ${true}
    ${'N2'}      | ${true}
    ${'N2,11'}   | ${true}
    ${'1,N2,11'} | ${false}
  `('weeksAreOutsideTerm("$time") = $expected', ({ time, expected }) => {
    expect(weeksAreOutsideTerm(time)).toEqual(expected);
  });

  it.each`
    term                                      | expected
    ${'T1 - Teaching Period One'}             | ${1}
    ${'T2 - Teaching Period Two'}             | ${2}
    ${'T3 - Teaching Period Three'}           | ${3}
    ${'MG1 - Management Teaching Period MG1'} | ${1}
    ${'AFB - ASU Fall Session B'}             | ${undefined}
    ${'KB - Hexamester 1'}                    | ${undefined}
  `('getTermNumber("$term") = $expected', ({ term, expected }) => {
    expect(getTermNumber(term)).toEqual(expected);
  });

  it.each`
    location                         | result
    ${'Science Theatre (K-F13-G09)'} | ${['Science Theatre', 'K-F13-G09']}
    ${'See School'}                  | ${[undefined, undefined]}
    ${'Online (ONLINE)'}             | ${['Online', 'ONLINE']}
  `('splitLocation("$location") === $result', ({ location, result }) => {
    expect(splitLocation(location)).toEqual(result);
  });

  it.each`
    Activity                 | Section   | expected
    ${'Course Enrolment'}    | ${'CR01'} | ${'CR01'}
    ${'Tutorial-Laboratory'} | ${'T11A'} | ${'TLB'}
    ${'Lecture'}             | ${'A'}    | ${'LEC'}
  `('getComponent', ({ Activity, Section, expected }) => {
    const data: StreamTableData = { ...baseStreamTableData, Activity, Section };
    const result = getComponent(data);
    expect(result).toBe(expected);
  });

  it.each`
    long                          | short
    ${'Tutorial-Laboratory'}      | ${'TLB'}
    ${'Lecture'}                  | ${'LEC'}
    ${'Tutorial'}                 | ${'TUT'}
    ${'Laboratory'}               | ${'LAB'}
    ${'Other'}                    | ${'OTH'}
    ${'Lecture Sequence 1 of 2'}  | ${'LE1'}
    ${'Lecture Sequence 2 of 2'}  | ${'LE2'}
    ${'Tutorial Sequence 1 of 2'} | ${'TU1'}
    ${'Tutorial 1 of 2'}          | ${'TU1'}
    ${'Laboratory 1 of 2'}        | ${'LA1'}
  `('getShortActivity("$long") = "$short"', ({ long, short }) => {
    expect(getShortActivity(long)).toEqual(short);
  });

  it.each([
    ['World Wide Web', DeliveryType.online],
    ['In Person', DeliveryType.person],
    ['Something Else', undefined],
  ])('getDelivery("%s") = %d', (input, expected) => {
    expect(getDelivery(input)).toEqual(expected);
  });

  it.each`
    day              | abbrev
    ${'Monday'}      | ${'M'}
    ${'Mon'}         | ${'M'}
    ${'M'}           | ${'M'}
    ${'Tuesday'}     | ${'T'}
    ${'Tue'}         | ${'T'}
    ${'T'}           | ${'T'}
    ${'Wednesday'}   | ${'W'}
    ${'Wed'}         | ${'W'}
    ${'W'}           | ${'W'}
    ${'Thursday'}    | ${'H'}
    ${'Thurs'}       | ${'H'}
    ${'Thur'}        | ${'H'}
    ${'Thu'}         | ${'H'}
    ${'H'}           | ${'H'}
    ${'Friday'}      | ${'F'}
    ${'Fri'}         | ${'F'}
    ${'F'}           | ${'F'}
    ${'Saturday'}    | ${'S'}
    ${'Sat'}         | ${'S'}
    ${'S'}           | ${'S'}
    ${'Sunday'}      | ${'s'}
    ${'Sun'}         | ${'s'}
    ${'s'}           | ${'s'}
    ${'Mon, Tue, Wed'} | ${'MTW'}
  `('abbreviateDay("$day") = "$abbrev"', ({ day, abbrev }) => {
    expect(abbreviateDay(day)).toEqual(abbrev);
  });

  it.each`
    time               | short
    ${'10:00 - 11:00'} | ${'10'}
    ${'09:00 - 10:00'} | ${'9'}
    ${'12:00 - 14:00'} | ${'12-14'}
    ${'08:00 - 11:00'} | ${'8-11'}
    ${'12:30 - 14:00'} | ${'12.5-14'}
    ${'12:30 - 13:30'} | ${'12.5'}
    ${'12:00 - 13:30'} | ${'12-13.5'}
  `('shortenTime("$time") = "$short"', ({ time, short }) => {
    expect(shortenTime(time)).toEqual(short);
  });

  it.each`
    section   | expected
    ${'WEB1'} | ${true}
    ${'LEC1'} | ${undefined}
    ${'TUT'} | ${undefined}
    ${'CR01'} | ${undefined}
  `('getIsWeb("$section") = $expected', ({ section, expected }) => {
    expect(getIsWeb(section)).toEqual(expected);
  });

  it.each`
    status         | expected
    ${'Full'}      | ${true}
    ${'full'}      | ${true}
    ${'FULL'}      | ${true}
    ${'Open'}      | ${undefined}
    ${'open'}      | ${undefined}
    ${'OPEN'}      | ${undefined}
    ${'Stop'}      | ${undefined}
    ${'Cancelled'} | ${undefined}
  `('getIsFull("$status") = $expected', ({ status, expected }) => {
    expect(getIsFull(status)).toEqual(expected);
  });

  it.each`
    status        | expected
    ${'M10'}      | ${false}
    ${'T9-12'}    | ${false}
    ${'W9'}       | ${false}
    ${'H15-18'}   | ${false}
    ${'S14-16'}   | ${false}
    ${'MTW10-16'} | ${true}
  `('isIntensive("$status") = $expected', ({ status, expected }) => {
    expect(isIntensive(status)).toEqual(expected);
  });

  it.each`
    status        | expected
    ${'M10'}      | ${false}
    ${'T9-12'}    | ${false}
    ${'W9'}       | ${false}
    ${'H15-18'}   | ${false}
    ${'S14-16'}   | ${true}
    ${'s10'}      | ${true}
    ${'MTW10-16'} | ${false}
    ${'MTS10-16'} | ${true}
  `('isOnWeekend("$status") = $expected', ({ status, expected }) => {
    expect(isOnWeekend(status)).toEqual(expected);
  });
});

import { getTimetableState } from '../reducers';
import { baseState, TimetableState } from '.';
import { CourseMap } from './Course';
import { undo, redo, push, StateHistory } from './StateHistory';

const courses: CourseMap = {
  a: { code: 'a', name: '', streams: [{ component: 'e', enrols: [0, 0], times: [] }], isAdditional: true },
  b: { code: 'b', name: '', streams: [{ component: 'f', enrols: [0, 0], times: [] }] },
  c: { code: 'c', name: '', streams: [] },
  d: { code: 'd', name: '', streams: [] },
};
const timetableStates: TimetableState[] = [
  getTimetableState(baseState),
  {
    courses,
    additional: [],
    chosen: [],
    colours: {},
    custom: [],
    events: [],
    options: {},
    timetable: baseState.timetable,
    webStreams: [],
  },
  {
    courses,
    additional: [],
    chosen: ['b'],
    colours: {},
    custom: [],
    events: [],
    options: {},
    timetable: baseState.timetable,
    webStreams: [],
  },
  {
    courses,
    additional: ['a'],
    chosen: ['b'],
    colours: {},
    custom: [],
    events: ['e'],
    options: {},
    timetable: baseState.timetable,
    webStreams: [],
  },
  {
    courses,
    additional: ['a'],
    chosen: [],
    colours: {},
    custom: [],
    events: ['e'],
    options: {},
    timetable: baseState.timetable,
    webStreams: [],
  },
];

describe('test history utilities', () => {
  // Undo
  test('undo works correctly', () => {
    const past = Object.freeze([...timetableStates.slice(0, 1)]);
    const present = timetableStates[1];
    const future = Object.freeze([...timetableStates.slice(2)]);
    const state = <StateHistory>Object.freeze({ past, present, future });
    const expected: StateHistory = {
      past: [],
      present: timetableStates[0],
      future: timetableStates.slice(1),
    };
    const result = undo(state);
    expect(result).toEqual(expected);
  })

  test('undo works correctly with empty future', () => {
    const past = Object.freeze([...timetableStates.slice(0, 4)]);
    const present = timetableStates[4];
    const future: TimetableState[] = [];
    const state = <StateHistory>Object.freeze({ past, present, future });
    const expected: StateHistory = {
      past: timetableStates.slice(0, 3),
      present: timetableStates[3],
      future: timetableStates.slice(4),
    };
    const result = undo(state);
    expect(result).toEqual(expected);
  })

  // Redo
  test('redo works correctly with one item in future', () => {
    const past = Object.freeze([...timetableStates.slice(0, 3)]);
    const present = timetableStates[3];
    const future = Object.freeze([...timetableStates.slice(4)]);
    const state = <StateHistory>Object.freeze({ past, present, future });
    const expected: StateHistory = {
      past: timetableStates.slice(0, 4),
      present: timetableStates[4],
      future: [],
    };
    const result = redo(state);
    expect(result).toEqual(expected);
  })

  test('redo works correctly with empty past', () => {
    const past: TimetableState[] = [];
    const present = timetableStates[0];
    const future = Object.freeze([...timetableStates.slice(1)]);
    const state = <StateHistory>Object.freeze({ past, present, future });
    const expected: StateHistory = {
      past: timetableStates.slice(0, 1),
      present: timetableStates[1],
      future: timetableStates.slice(2),
    };
    const result = redo(state);
    expect(result).toEqual(expected);
  })

  // Push
  const firstState = Object.freeze(timetableStates[0])
  const history: StateHistory = { past: [], present: firstState, future: [] };

  const doPushTest = (nextState: TimetableState) => {
    const originalHistory = { ...history };
    const result = push(history, nextState);
    expect(result).not.toBe(history);
    expect(result).toEqual({ past: [firstState], present: nextState, future: [] });
    expect(history).toEqual(originalHistory);
  }

  test('push history does nothing when state doesn\'t change', () => {
    const originalHistory = { ...history };
    const result = push(history, Object.freeze(timetableStates[0]));
    expect(result).toBe(history);
    expect(result).toEqual(originalHistory);
  })

  test('push history changes when additional courses change', () => {
    const nextState: TimetableState = { ...firstState, additional: [ ...firstState.additional ] };
    doPushTest(nextState);
  })

  test('push history changes when chosen courses change', () => {
    const nextState: TimetableState = { ...firstState, chosen: [ ...firstState.chosen ] };
    doPushTest(nextState);
  })

  test('push history changes when custom courses change', () => {
    const nextState: TimetableState = { ...firstState, custom: [ ...firstState.custom ] };
    doPushTest(nextState);
  })

  test('push history changes when events change', () => {
    const nextState: TimetableState = { ...firstState, events: [ ...firstState.events ] };
    doPushTest(nextState);
  })

  test('push history changes when webStreams change', () => {
    const nextState: TimetableState = { ...firstState, webStreams: [ ...firstState.webStreams ] };
    doPushTest(nextState);
  })

  test('push history changes when options change', () => {
    const nextState: TimetableState = { ...firstState, options: { ...firstState.options } };
    doPushTest(nextState);
  })

  test('push history changes when colours change', () => {
    const nextState: TimetableState = { ...firstState, colours: { ...firstState.colours } };
    doPushTest(nextState);
  })

  test('push history changes when colours change', () => {
    const nextState: TimetableState = { ...firstState, colours: { ...firstState.colours } };
    doPushTest(nextState);
  })

  test('push history changes when colours change', () => {
    const nextState: TimetableState = { ...firstState, colours: { ...firstState.colours } };
    doPushTest(nextState);
  })

  test('push clears future array', () => {
    const newHistory: StateHistory = { ...history, future: timetableStates.slice(1) };
    const nextState: TimetableState = { ...firstState, colours: { ...firstState.colours } };
    const result = push(newHistory, nextState);
    expect(result.future).toEqual([]);
    expect(result.future).not.toEqual(newHistory.future);
  })
})

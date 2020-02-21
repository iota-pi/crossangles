import { events, options, hiddenEvents } from './commitments';
import { ClearNoticeAction, CLEAR_NOTICE, EventAction, TOGGLE_EVENT, CourseAction, ADD_COURSE, ToggleOptionAction, TOGGLE_OPTION, ToggleShowEventsAction, TOGGLE_SHOW_EVENTS } from '../actions';
import { baseState } from '../state';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('events reducer', () => {
  it('initialises correctly', () => {
    const state = events(undefined, otherAction);
    expect(state).toEqual(baseState.events);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = Object.freeze([...baseState.events]);
    const result = events(state, otherAction);
    expect(result).toBe(state);
  })

  it('allows toggling one event on', () => {
    const state = Object.freeze([...baseState.events]);
    const action: EventAction = {
      type: TOGGLE_EVENT,
      event: 'abc',
    };
    const result = events(state, action);
    expect(result).toContain('abc');
  })

  it('allows toggling one events off', () => {
    const state = Object.freeze(['abc']);
    const action: EventAction = {
      type: TOGGLE_EVENT,
      event: 'abc',
    };
    const result = events(state, action);
    expect(result).toEqual([]);
  })

  it('allows toggling one of many events on', () => {
    const state = Object.freeze(['a', 'b']);
    const action: EventAction = {
      type: TOGGLE_EVENT,
      event: 'c',
    };
    const result = events(state, action);
    expect(result).toEqual(['a', 'b', 'c']);
  })

  it('allows toggling one of many events of', () => {
    const state = Object.freeze(['a', 'b', 'c']);
    const action: EventAction = {
      type: TOGGLE_EVENT,
      event: 'c',
    };
    const result = events(state, action);
    expect(result).toEqual(['a', 'b']);
  })

  it('selects event if the course only has one event', () => {
    const state = Object.freeze([]);
    const action: CourseAction = {
      type: ADD_COURSE,
      course: {
        code: '',
        name: '',
        isAdditional: true,
        streams: [
          { component: 'a', enrols: [0, 0], times: [] },
          { component: 'a', enrols: [0, 0], times: [] },
        ],
      },
    };
    const result = events(state, action);
    expect(result).toEqual(['a']);
  })

  it('doesn\'t select event if the course has more than one', () => {
    const state = Object.freeze([]);
    const action: CourseAction = {
      type: ADD_COURSE,
      course: {
        code: '',
        name: '',
        isAdditional: true,
        streams: [
          { component: 'a', enrols: [0, 0], times: [] },
          { component: 'b', enrols: [0, 0], times: [] },
        ],
      },
    };
    const result = events(state, action);
    expect(result).toEqual([]);
  })

  it('doesn\'t select "events" from non additional courses', () => {
    const state = Object.freeze([]);
    const action: CourseAction = {
      type: ADD_COURSE,
      course: {
        code: '',
        name: '',
        streams: [
          { component: 'a', enrols: [0, 0], times: [] },
        ],
      },
    };
    const result = events(state, action);
    expect(result).toEqual([]);
  })

  it('doesn\'t select events from auto-selected courses', () => {
    const state = Object.freeze([]);
    const action: CourseAction = {
      type: ADD_COURSE,
      course: {
        code: '',
        name: '',
        isAdditional: true,
        autoSelect: true,
        streams: [
          { component: 'a', enrols: [0, 0], times: [] },
        ],
      },
    };
    const result = events(state, action);
    expect(result).toEqual([]);
  })
})

describe('options reducer', () => {
  it('initialises correctly', () => {
    const state = options(undefined, otherAction);
    expect(state).toEqual(baseState.options);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = Object.freeze({ ...baseState.options });
    const result = options(state, otherAction);
    expect(result).toBe(state);
  })

  it('allows toggling options on from undefined', () => {
    const state = Object.freeze({});
    const action: ToggleOptionAction = {
      type: TOGGLE_OPTION,
      option: 'includeFull',
    };
    const result = options(state, action);
    expect(result['includeFull']).toBe(true);
  })

  it('allows toggling options on from false', () => {
    const state = Object.freeze({'includeFull': false});
    const action: ToggleOptionAction = {
      type: TOGGLE_OPTION,
      option: 'includeFull',
    };
    const result = options(state, action);
    expect(result['includeFull']).toBe(true);
  })

  it('allows toggling options off', () => {
    const state = Object.freeze({'includeFull': true});
    const action: ToggleOptionAction = {
      type: TOGGLE_OPTION,
      option: 'includeFull',
    };
    const result = options(state, action);
    expect(result['includeFull']).toEqual(false);
  })
})

describe('hiddenEvents reducer', () => {
  it('initialises correctly', () => {
    const state = hiddenEvents(undefined, otherAction);
    expect(state).toEqual(baseState.hiddenEvents);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = Object.freeze([...baseState.hiddenEvents]);
    const result = hiddenEvents(state, otherAction);
    expect(result).toBe(state);
  })

  it('allows toggling on for one course', () => {
    const state = Object.freeze([]);
    const action: ToggleShowEventsAction = {
      type: TOGGLE_SHOW_EVENTS,
      course: 'a',
    };
    const result = hiddenEvents(state, action);
    expect(result).toEqual(['a']);
  })

  it('allows toggling off for one course', () => {
    const state = Object.freeze(['a']);
    const action: ToggleShowEventsAction = {
      type: TOGGLE_SHOW_EVENTS,
      course: 'a',
    };
    const result = hiddenEvents(state, action);
    expect(result).toEqual([]);
  })

  it('allows toggling on with other courses', () => {
    const state = Object.freeze(['a', 'b']);
    const action: ToggleShowEventsAction = {
      type: TOGGLE_SHOW_EVENTS,
      course: 'c',
    };
    const result = hiddenEvents(state, action);
    expect(result).toEqual(['a', 'b', 'c']);
  })

  it('allows toggling off with other courses', () => {
    const state = Object.freeze(['a', 'b', 'c']);
    const action: ToggleShowEventsAction = {
      type: TOGGLE_SHOW_EVENTS,
      course: 'c',
    };
    const result = hiddenEvents(state, action);
    expect(result).toEqual(['a', 'b']);
  })
})

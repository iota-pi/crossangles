import { colours } from './colours';
import { ClearNoticeAction, CLEAR_NOTICE, ColourAction, SET_COLOUR, ADD_COURSE, CourseAction, CourseListAction, SET_COURSE_DATA } from '../actions';
import { baseState } from '../state';
import { ColourMap, COURSE_COLOURS } from '../state/Colours';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('colours reducer', () => {
  it('initialises correctly', () => {
    const result = colours(undefined, otherAction);
    expect(result).toBe(baseState.colours);
  })

  it('doesn\'t change on no-op actions', () => {
    const currentState: ColourMap = { 'a': '#00796B' };
    const result = colours(currentState, otherAction);
    expect(result).toBe(currentState);
  })

  it('selects default value before picking a random one', () => {
    const action1: CourseAction = {
      type: ADD_COURSE,
      course: { code: 'a', name: '', streams: [], defaultColour: COURSE_COLOURS[2] },
    };
    const action2: CourseAction = {
      type: ADD_COURSE,
      course: { code: 'b', name: '', streams: [], defaultColour: COURSE_COLOURS[3] },
    };

    const prevState = { ...baseState.colours };
    let state = colours(prevState, action1);
    expect(prevState).toEqual(baseState.colours);
    state = colours(state, action2);

    expect(state['a']).toBe(COURSE_COLOURS[2]);
    expect(state['b']).toBe(COURSE_COLOURS[3]);
  })

  it('picks non-duplicate colours for ADD_COURSE', () => {
    let state = baseState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const action: CourseAction = {
        type: ADD_COURSE,
        course: {
          code: 'TEST000' + i,
          name: 'Introduction to Waterfall Development',
          streams: [],
        },
      };

      // Check immutability
      const prevState = { ...state };
      const nextState = colours(state, action);
      expect(state).toEqual(prevState);
      state = nextState;
    }

    // Check for no duplicates
    expect(new Set(Object.values(state))).toEqual(new Set(COURSE_COLOURS));
  })

  it('picks a colour even when none are free', () => {
    let currentState = COURSE_COLOURS.reduce((all, c, i) => ({ ...all, ['' + i]: c }), {} as ColourMap);
    const course = 'TEST0000';
    const action: ColourAction = {
      type: SET_COLOUR,
      course,
    };
    const newState = colours(currentState, action);

    expect(Object.keys(newState)).toContain(course);
    expect(COURSE_COLOURS).toContain(newState[course]);
    expect(new Set(Object.values(newState))).toEqual(new Set(COURSE_COLOURS));
  })

  it('chooses non-duplicate colours for SET_COLOUR', () => {
    let currentState = baseState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const action: ColourAction = {
        type: SET_COLOUR,
        course: 'TEST000' + i,
      };
      currentState = colours(currentState, action);
    }
    expect(new Set(Object.values(currentState))).toEqual(new Set(COURSE_COLOURS));
  })

  it('allows manually selecting duplicate values', () => {
    let currentState = COURSE_COLOURS.reduce((all, c, i) => ({ ...all, ['' + i]: c }), {} as ColourMap);
    const course = 'TEST0000';
    const colour = COURSE_COLOURS[0];
    const action: ColourAction = {
      type: SET_COLOUR,
      course,
      colour,
    };
    const newState = colours(currentState, action);

    expect(newState[course]).toBe(colour);
    expect(new Set(Object.values(newState))).toEqual(new Set(COURSE_COLOURS));
  })

  it('defaults additional courses to correct value when selected', () => {
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      courses: [
        { code: 'a', name: '', streams: [], autoSelect: true, isAdditional: true, defaultColour: COURSE_COLOURS[0] },
        { code: 'b', name: '', streams: [], autoSelect: true, isAdditional: true, defaultColour: COURSE_COLOURS[1] },
        { code: 'c', name: '', streams: [], autoSelect: true, isAdditional: true },
        { code: 'd', name: '', streams: [], autoSelect: true },
      ],
    };

    const prevState = { ...baseState.colours };
    const state = colours(prevState, action);
    expect(prevState).toEqual(baseState.colours);

    expect(state['a']).toBe(COURSE_COLOURS[0]);
    expect(state['b']).toBe(COURSE_COLOURS[1]);
    expect(state['c']).not.toBe(COURSE_COLOURS[0]);
    expect(state['c']).not.toBe(COURSE_COLOURS[1]);
    expect(state['c']).not.toBeUndefined();
    expect(state['d']).toBeUndefined();
  })
})

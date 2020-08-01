import { colours } from './colours';
import {
  ADD_COURSE,
  ClearNoticeAction,
  CLEAR_NOTICE,
  ColourAction,
  CourseAction,
  CourseListAction,
  REMOVE_COURSE,
  SET_COLOUR,
  SET_COURSE_DATA,
} from '../actions';
import {
  ColourMap,
  Colour,
  COURSE_COLOURS,
  CourseData,
  getCourseId,
  initialState,
} from '../state';
import { getCourse, getMeta } from '../test_util';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };
const CBS_COLOUR: Colour = 'indigo';

describe('colours reducer', () => {
  it('initialises correctly', () => {
    const result = colours(undefined, otherAction);
    expect(result).toBe(initialState.colours);
  });

  it('doesn\'t change on no-op actions', () => {
    const currentState: ColourMap = { a: CBS_COLOUR };
    const result = colours(currentState, otherAction);
    expect(result).toBe(currentState);
  });

  it('selects default value before picking a random one', () => {
    const action1: CourseAction = {
      type: ADD_COURSE,
      course: { code: 'a', name: '', streams: [], defaultColour: COURSE_COLOURS[2] },
    };
    const action2: CourseAction = {
      type: ADD_COURSE,
      course: { code: 'b', name: '', streams: [], defaultColour: COURSE_COLOURS[3] },
    };

    const prevState = { ...initialState.colours };
    let state = colours(prevState, action1);
    expect(prevState).toEqual(initialState.colours);
    state = colours(state, action2);

    expect(state.a).toBe(COURSE_COLOURS[2]);
    expect(state.b).toBe(COURSE_COLOURS[3]);
  });

  it('picks non-duplicate colours for ADD_COURSE', () => {
    let state = initialState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const action: CourseAction = {
        type: ADD_COURSE,
        course: {
          code: `TEST000${i}`,
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
  });

  it('picks a colour even when none are free', () => {
    const currentState = COURSE_COLOURS.reduce(
      (all, c, i) => ({ ...all, [i.toString()]: c }), {} as ColourMap,
    );
    const course = 'TEST0000';
    const action: ColourAction = {
      type: SET_COLOUR,
      course,
    };
    const newState = colours(currentState, action);

    expect(Object.keys(newState)).toContain(course);
    expect(COURSE_COLOURS).toContain(newState[course]);
    expect(new Set(Object.values(newState))).toEqual(new Set(COURSE_COLOURS));
  });

  it('picks a colour for a new custom course', () => {
    const course: CourseData = { ...getCourse(), isCustom: true };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const state: ColourMap = {};
    const result = colours(state, action);
    expect(result).not.toBe(state);
    expect(Object.keys(result)).toEqual([getCourseId(course)]);
  });

  it('doesn\'t pick a colour when updating a custom course', () => {
    const course: CourseData = { ...getCourse(), isCustom: true };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const originalState: ColourMap = { [getCourseId(course)]: CBS_COLOUR };
    const state: ColourMap = { ...originalState };
    const result = colours(state, action);
    expect(result).toBe(state);
    expect(result).toEqual(originalState);
  });

  it('frees colour when course is deselected', () => {
    const course: CourseData = { ...getCourse(), isCustom: true };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const originalState: ColourMap = { [getCourseId(course)]: CBS_COLOUR };
    const state: ColourMap = { ...originalState };
    const result = colours(state, action);
    expect(result).not.toBe(state);
    expect(result).toEqual({});
  });

  it('chooses non-duplicate colours for SET_COLOUR', () => {
    let currentState = initialState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const action: ColourAction = {
        type: SET_COLOUR,
        course: `TEST000${i}`,
      };
      currentState = colours(currentState, action);
    }
    expect(new Set(Object.values(currentState))).toEqual(new Set(COURSE_COLOURS));
  });

  it('allows manually selecting duplicate values', () => {
    const currentState = COURSE_COLOURS.reduce(
      (all, c, i) => ({ ...all, [i.toString()]: c }), {} as ColourMap,
    );
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
  });

  it('defaults additional courses to correct value when selected', () => {
    const courses = COURSE_COLOURS.map((colour, i): CourseData => ({
      code: i.toString(),
      name: '',
      streams: [],
      autoSelect: true,
      isAdditional: true,
      defaultColour: colour,
    }));
    courses.pop();
    courses.pop();
    courses.push({ code: 'a', name: '', streams: [], autoSelect: true, isAdditional: true });
    courses.push({ code: 'b', name: '', streams: [], autoSelect: true, isAdditional: true });
    courses.push({ code: 'c', name: '', streams: [], autoSelect: true });

    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta: getMeta(),
      courses,
    };

    const prevState = { ...initialState.colours };
    const state = colours(prevState, action);
    expect(prevState).toEqual(initialState.colours);

    for (let i = 0; i < COURSE_COLOURS.length - 2; ++i) {
      expect(state[i.toString()]).toBe(COURSE_COLOURS[i]);
      expect(state.a).not.toBe(COURSE_COLOURS[i]);
      expect(state.b).not.toBe(COURSE_COLOURS[i]);
    }
    expect(state.a).not.toBeUndefined();
    expect(state.b).not.toBeUndefined();
    expect(state.a).not.toBe(state.b);
    expect(state.c).toBeUndefined();
  });
});

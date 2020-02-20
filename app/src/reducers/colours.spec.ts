import { colours } from './colours';
import { ClearNoticeAction, CLEAR_NOTICE, ColourAction, SET_COLOUR, ADD_COURSE, CourseAction } from '../actions';
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

  it('picks non-duplicate colours for ADD_COURSE', () => {
    let currentState = baseState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const action: CourseAction = {
        type: ADD_COURSE,
        course: {
          code: 'TEST000' + i,
          name: 'Introduction to Waterfall Development',
          streams: [],
        },
      };
      currentState = colours(currentState, action);
    }
    expect(new Set(Object.values(currentState))).toEqual(new Set(COURSE_COLOURS));
  })

  xit('picks a colour even when none are free', () => {
  })

  it('defaults to non-duplicate colours for SET_COLOUR', () => {
    let currentState = baseState.colours;
    for (let i = 0; i < COURSE_COLOURS.length; ++i) {
      const course = 'TEST000' + i;
      const action: ColourAction = {
        type: SET_COLOUR,
        course,
      };
      currentState = colours(currentState, action);
    }
    expect(new Set(Object.values(currentState))).toEqual(new Set(COURSE_COLOURS));
  })

  xit('allows manually selecting duplicate values', () => {
  })

  xit('defaults additional courses to correct value', () => {
  })
})

import { meta } from './meta';
import { ClearNoticeAction, CLEAR_NOTICE, SET_COURSE_DATA, CourseListAction } from '../actions';
import { initialState, Meta } from '../state';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('meta reducer', () => {
  it('initialises correctly', () => {
    const state = meta(undefined, otherAction);
    expect(state).toEqual(initialState.meta);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = { ...initialState.meta };
    const result = meta(state, otherAction);
    expect(result).toBe(state);
    expect(state).toEqual(initialState.meta);
  })

  it('can be set', () => {
    const testMeta = { ...initialState.meta };
    const newMeta: Meta = {
      year: 1984,
      term: 1,
      sources: [],
      updateDate: '',
      updateTime: '',
    };
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      courses: [],
      meta: newMeta,
    };
    const state = meta(testMeta, action);
    expect(testMeta).toEqual(initialState.meta);
    expect(state).toEqual(newMeta);
  })
})

import { additional } from './courses';
import { initialState } from '../state';
import { CourseListAction, CourseAction, REMOVE_COURSE, SET_COURSE_DATA } from '../actions';
import { CourseData, getCourseId } from '../state/Course';

describe('additional', () => {
  it('initialises correctly', () => {
    expect(additional(undefined, { type: '@@INIT' } as any)).toEqual(initialState.additional);
  })

  it('returns same object for no-ops', () => {
    const state = [ ...initialState.additional ];
    const result = additional(state, { type: 'NO_OP_ACTION' } as any);
    expect(result).toBe(state);
    expect(result).toEqual(initialState.additional);
  })

  it('automatically adds additional courses marked as autoSelect', () => {
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      courses: [
        { code: 'COMP1511', name: 'Computing 1A', streams: [], autoSelect: true },
        { code: 'EU', name: 'Evangelical Union', streams: [], isAdditional: true, autoSelect: true },
        { code: 'CBS', name: 'Campus Bible Study', streams: [], isAdditional: true, autoSelect: true },
        { code: 'Street Talk', name: 'Street Talk', streams: [], isAdditional: true },
      ],
    };
    const result = additional([], action);
    expect(result).toEqual(['EU', 'CBS']);
  })

  it('allows removing courses', () => {
    const course: CourseData = {
      code: 'RING9731',
      name: 'Introduction to Ring Theory',
      streams: [],
      isAdditional: true,
      term: 'T1C',
    };
    const id = getCourseId(course);
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const result = additional(['observerA', id, 'observerB'], action);
    expect(result).toEqual(['observerA', 'observerB']);
  })
})

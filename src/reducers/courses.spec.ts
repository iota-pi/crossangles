import { additional, custom, chosen } from './courses';
import { initialState } from '../state';
import { CourseListAction, CourseAction, REMOVE_COURSE, SET_COURSE_DATA, CustomAction, ADD_CUSTOM, REMOVE_CUSTOM, ADD_COURSE } from '../actions';
import { CourseData, getCourseId } from '../state/Course';
import { getCourse } from '../test_util';


describe('chosen', () => {
  it('initialises correctly', () => {
    expect(chosen(undefined, { type: '@@INIT' } as any)).toEqual(initialState.chosen);
  })

  it('returns same object for no-ops', () => {
    const state = [ ...initialState.chosen ];
    const result = chosen(state, { type: 'NO_OP_ACTION' } as any);
    expect(result).toBe(state);
    expect(result).toEqual(initialState.chosen);
  })

  it('allows adding a first chosen course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const result = chosen([], action);
    expect(result).toEqual([getCourseId(course)]);
  })

  it('allows adding a second chosen course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const result = chosen(['observer'], action);
    expect(result).toEqual(['observer', getCourseId(course)]);
  })

  it('allows removing the only chosen course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const result = chosen([getCourseId(course)], action);
    expect(result).toEqual([]);
  })

  it('allows removing one of many chosen courses', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const result = chosen(['observerA', getCourseId(course), 'observerB'], action);
    expect(result).toEqual(['observerA', 'observerB']);
  })

  it('removes courses which no longer exist', () => {
    const courses: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const courseIds = courses.map(c => getCourseId(c));
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      courses,
    };
    const state = ['extra1', courseIds[0], 'extra3', courseIds[1], 'extra3'];
    const result = chosen(state, action);
    expect(result).toEqual(courseIds);
  })

  it('doesn\'t change if all courses exist', () => {
    const courses: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const courseIds = courses.map(c => getCourseId(c));
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      courses,
    };
    const state = [ ...courseIds ];
    const result = chosen(state, action);
    expect(result).toBe(state);
    expect(result).toEqual(courseIds);
  })
})


describe('custom', () => {
  it('initialises correctly', () => {
    expect(custom(undefined, { type: '@@INIT' } as any)).toEqual(initialState.custom);
  })

  it('returns same object for no-ops', () => {
    const state = [ ...initialState.custom ];
    const result = custom(state, { type: 'NO_OP_ACTION' } as any);
    expect(result).toBe(state);
    expect(result).toEqual(initialState.custom);
  })

  it('allows adding a first custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CustomAction = {
      type: ADD_CUSTOM,
      custom: course,
    };
    const result = custom([], action);
    expect(result).toEqual([getCourseId(course)]);
  })

  it('allows adding a second custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CustomAction = {
      type: ADD_CUSTOM,
      custom: course,
    };
    const result = custom(['observer'], action);
    expect(result).toEqual(['observer', getCourseId(course)]);
  })

  it('allows removing the only custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CustomAction = {
      type: REMOVE_CUSTOM,
      custom: course,
    };
    const result = custom([getCourseId(course)], action);
    expect(result).toEqual([]);
  })

  it('allows removing one of many custom courses', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CustomAction = {
      type: REMOVE_CUSTOM,
      custom: course,
    };
    const result = custom(['observerA', getCourseId(course), 'observerB'], action);
    expect(result).toEqual(['observerA', 'observerB']);
  })
})


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

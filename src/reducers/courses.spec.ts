import { additional, custom, chosen, courses } from './courses';
import { CourseListAction, CourseAction, REMOVE_COURSE, SET_COURSE_DATA, ADD_COURSE } from '../actions';
import { CourseData, CourseMap, CourseId, getCourseId, initialState, Career } from '../state';
import { getCourse, getMeta } from '../test_util';

const meta = getMeta();


describe('courses', () => {
  it('initialises correctly', () => {
    expect(courses(undefined, { type: '@@INIT' } as any)).toEqual(initialState.courses);
  })

  it('returns same object for no-ops', () => {
    const state = { ...initialState.courses };
    const result = courses(state, { type: 'NO_OP_ACTION' } as any);
    expect(result).toBe(state);
    expect(result).toEqual(initialState.courses);
  })

  it('sets course data when blank', () => {
    const courseList: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: courseList,
    };
    const state = {};
    const result = courses(state, action);
    expect(result).toEqual({
      [getCourseId(courseList[0])]: courseList[0],
      [getCourseId(courseList[1])]: courseList[1],
    });
  })

  it('merges new course data with existing data', () => {
    const courseList: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: courseList,
    };
    const state: CourseMap = {
      // Unchanged course
      [getCourseId(courseList[0])]: { code: 'RING1379', name: 'Old Ring Theory Name', streams: [] },

      // Custom course
      'custom': { code: 'custom', name: 'Observation', streams: [], isCustom: true },

      // Removed course
      'oldcourse': { code: 'oldcourse', name: 'Observation', streams: [] },

      // Changed course
      'RING9731': {
        code: 'RING9731',
        name: 'Introduction to Ring Theory',
        streams: [],
        section: 'CR01',
        career: Career.PGRD,
      },
    };
    const result = courses(state, action);
    expect(result).toEqual({
      'custom': state['custom'],
      [getCourseId(courseList[0])]: courseList[0],
      [getCourseId(courseList[1])]: courseList[1],
    });
    expect(result[getCourseId(courseList[0])].name).toBe(courseList[0].name);
  })

  it('isn\'t affected by choosing non-custom courses', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const originalState = { [getCourseId(course)]: course };
    const state = { ...originalState };
    const result = courses(state, action);
    expect(result).toBe(state);
    expect(result).toEqual(originalState);
  })

  it('handles new custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const state = {};
    const result = courses(state, action);
    expect(result).toEqual({
      ...state,
      [getCourseId(course)]: course,
    });
  })

  it('handles updating a custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const updatedCourse: CourseData = {
      ...course,
      name: 'New Ring Theory Name',
    };
    const action: CourseAction = {
      type: ADD_COURSE,
      course: updatedCourse,
    };
    const state = { [getCourseId(course)]: course };
    const result = courses(state, action);
    expect(result).toEqual({
      ...state,
      [getCourseId(updatedCourse)]: updatedCourse,
    });
  })

  it('handles removing only custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const state = { [getCourseId(course)]: course };
    const result = courses(state, action);
    expect(result).toEqual({});
  })

  it('removing a custom course doesn\'t affect other courses', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const observerCourse: CourseData = {
      code: 'observer',
      name: 'observer',
      streams: [],
    };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const state = {
      [getCourseId(course)]: course,
      [getCourseId(observerCourse)]: observerCourse,
    };
    const result = courses(state, action);
    expect(result).toEqual({
      [getCourseId(observerCourse)]: observerCourse,
    });
  })

  it('isn\'t affected by unselecting a non-custom course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const state: CourseMap = { [getCourseId(course)]: course };
    const result = courses(state, action);
    expect(result).toBe(state);
    expect(result).toEqual({ [getCourseId(course)]: course });
  })
})


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

  it('isn\'t affected by adding a custom course', () => {
    const course: CourseData = { ...getCourse(), isCustom: true };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const state: CourseId[] = [];
    const result = chosen(state, action);
    expect(result).toBe(state);
    expect(result).toEqual([]);
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
    const courseList: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const courseIds = courseList.map(c => getCourseId(c));
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: courseList,
    };
    const state = ['extra1', courseIds[0], 'extra3', courseIds[1], 'extra3'];
    const result = chosen(state, action);
    expect(result).toEqual(courseIds);
  })

  it('doesn\'t change if all courses exist', () => {
    const courseList: CourseData[] = [
      { code: 'RING1379', name: 'Ring Theory 1A', streams: [] },
      { code: 'RING9731', name: 'Introduction to Ring Theory', streams: [] },
    ];
    const courseIds = courseList.map(c => getCourseId(c));
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: courseList,
    };
    const state = [ ...courseIds ];
    const result = chosen(state, action);
    expect(result).toBe(state);
    expect(result).toEqual(courseIds);
  })

  it('isn\'t affected by removing a custom course', () => {
    const course: CourseData = { ...getCourse(), isCustom: true };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const state: CourseId[] = [getCourseId(course)];
    const result = chosen(state, action);
    expect(result).toBe(state);
    expect(result).toEqual([getCourseId(course)]);
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
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const result = custom([], action);
    expect(result).toEqual([getCourseId(course)]);
  })

  it('allows adding a second custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const result = custom(['observer'], action);
    expect(result).toEqual(['observer', getCourseId(course)]);
  })

  it('allows updating existing custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const state = [getCourseId(course)]
    const result = custom(state, action);
    expect(result).toBe(state);
  })

  it('isn\'t affected by selecting a non-custom course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: ADD_COURSE,
      course,
    };
    const state: CourseId[] = [];
    const result = custom(state, action);
    expect(result).toBe(state);
    expect(result).toEqual([]);
  })

  it('allows removing the only custom course', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const result = custom([getCourseId(course)], action);
    expect(result).toEqual([]);
  })

  it('allows removing one of many custom courses', () => {
    const course: CourseData = {
      ...getCourse(),
      isCustom: true,
    };
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const result = custom(['observerA', getCourseId(course), 'observerB'], action);
    expect(result).toEqual(['observerA', 'observerB']);
  })

  it('isn\'t affected by unselecting a non-custom course', () => {
    const course = getCourse();
    const action: CourseAction = {
      type: REMOVE_COURSE,
      course,
    };
    const state: CourseId[] = [getCourseId(course)];
    const result = custom(state, action);
    expect(result).toBe(state);
    expect(result).toEqual([getCourseId(course)]);
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
      meta,
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

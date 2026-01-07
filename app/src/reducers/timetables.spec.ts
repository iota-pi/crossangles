import { timetables, suggestionScore } from './timetables';
import {
  ClearNoticeAction,
  CLEAR_NOTICE,
  UPDATE_SESSION_MANAGER,
  SessionManagerAction,
  UPDATE_SUGGESTED_TIMETABLE,
  SuggestionAction,
  CourseListAction,
  SET_COURSE_DATA,
} from '../actions';
import { initialState, Timetables, getCurrentTerm } from '../state';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { getMeta } from '../test_util';
import { SessionPlacementData } from '../components/Timetable/SessionPlacement';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };
const baseSessionPlacement: Omit<SessionPlacementData, 'session'> = {
  clashDepth: 0,
  isDragging: false,
  isRaised: false,
  isSnapped: false,
  offset: { x: 0, y: 0 },
  touched: false,
};

describe('timetables reducer', () => {
  it('initialises correctly', () => {
    const state = timetables(undefined, otherAction);
    expect(state).toEqual(initialState.timetables);
  });

  it('doesn\'t change on no-op actions', () => {
    const state = { ...initialState.timetables };
    const result = timetables(state, otherAction);
    expect(result).toBe(state);
    expect(state).toEqual(initialState.timetables);
  });

  it('can be set', () => {
    const initialTimetable = { ...initialState.timetables };
    const s = new SessionManager();
    s.update([], 10);
    const term = 'a';
    const action: SessionManagerAction = {
      type: UPDATE_SESSION_MANAGER,
      sessionManager: s.data,
      term,
    };
    const state = timetables(initialTimetable, action);
    expect(initialTimetable).toEqual(initialState.timetables);
    expect(state[term]).toEqual(s.data);
  });

  it('filters out sessions for courses that are removed', () => {
    const timetable: SessionManagerData = {
      map: [
        [
          'RING1379~LEC~0',
          {
            ...baseSessionPlacement,
            session: {
              course: 'RING1379', day: 'F', start: 9, end: 10, index: 0, stream: 'RING1379~LEC~F9',
            },
          },
        ],
        [
          'RING9731~TUT~0',
          {
            ...baseSessionPlacement,
            session: {
              course: 'RING9731', day: 'M', start: 9, end: 10, index: 0, stream: 'RING9731~TUT~M9',
            },
          },
        ],
      ],
      order: ['RING9731~TUT~0', 'RING1379~LEC~0'],
      renderOrder: ['RING1379~LEC~0', 'RING9731~TUT~0'],
      version: 42,
      score: 1379,
    };
    const meta = getMeta();
    const term = getCurrentTerm(meta);
    const state: Timetables = { [term]: timetable };
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: [
        {
          code: 'RING9731',
          name: '',
          streams: [
            {
              component: 'TUT',
              times: [{ time: 'M9' }],
            },
          ],
        },
      ],
      isNewTerm: false,
    };
    const result = timetables(state, action);
    const expected = {
      ...timetable,
      map: timetable.map.slice(1),
      order: timetable.order.slice(0, 1),
      renderOrder: timetable.renderOrder.slice(1),
    };
    expect(result[term]).toEqual(expected);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('filters out streams which were removed', () => {
    const timetable: SessionManagerData = {
      map: [
        [
          'RING1379~LEC~0',
          {
            ...baseSessionPlacement,
            session: {
              course: 'RING1379', day: 'F', start: 9, end: 10, index: 0, stream: 'RING1379~LEC~F9',
            },
          },
        ],
        [
          'RING1379~TUT~0',
          {
            ...baseSessionPlacement,
            session: {
              course: 'RING1379', day: 'M', start: 9, end: 10, index: 0, stream: 'RING1379~TUT~M9',
            },
          },
        ],
        [
          'RING1379~SEM~0',
          {
            ...baseSessionPlacement,
            session: {
              course: 'RING1379', day: 'H', start: 9, end: 10, index: 0, stream: 'RING1379~SEM~H9',
            },
          },
        ],
      ],
      order: ['RING1379~TUT~0', 'RING1379~LEC~0', 'RING1379~SEM~0'],
      renderOrder: ['RING1379~LEC~0', 'RING1379~SEM~0', 'RING1379~TUT~0'],
      version: 42,
      score: 1379,
    };
    const meta = getMeta();
    const term = getCurrentTerm(meta);
    const state: Timetables = { [term]: timetable };
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta,
      courses: [
        {
          code: 'RING1379',
          name: '',
          streams: [
            {
              component: 'LEC',
              times: [{ time: 'M8' }],
            },
            {
              component: 'SEM',
              times: [{ time: 'H9' }],
            },
          ],
        },
      ],
      isNewTerm: false,
    };
    const result = timetables(state, action);
    const expected = {
      ...timetable,
      map: timetable.map.slice(2),
      order: ['RING1379~SEM~0'],
      renderOrder: ['RING1379~SEM~0'],
    };
    expect(result[term]).toEqual(expected);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('works when setting course data for the first time (no timetable yet)', () => {
    const state: Timetables = { ...initialState.timetables };
    const action: CourseListAction = {
      type: SET_COURSE_DATA,
      meta: getMeta(),
      courses: [
        { code: 'RING9731', name: '', streams: [] },
      ],
      isNewTerm: false,
    };
    expect(() => timetables(state, action)).not.toThrow();
    expect(timetables(state, action)).toEqual(state);
  });
});

describe('suggestionScore reducer', () => {
  it('initialises correctly', () => {
    const state = suggestionScore(undefined, otherAction);
    expect(state).toEqual(initialState.suggestionScore);
  });

  it('doesn\'t change on no-op actions', () => {
    const states = [initialState.suggestionScore, null, 0, -1, 1000];
    for (const state of states) {
      const result = suggestionScore(state, otherAction);
      expect(result).toBe(state);
    }
  });

  it('can be set when null', () => {
    const initial = null;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 0,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(0);
  });

  it('can be set when zero', () => {
    const initial = 0;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 10,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(10);
  });

  it('can be set when non-zero', () => {
    const initial = 123;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 1,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(1);
  });
});

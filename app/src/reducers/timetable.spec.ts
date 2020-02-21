import { timetable, suggestionScore } from './timetable';
import { ClearNoticeAction, CLEAR_NOTICE, SET_META_DATA, MetaAction, UPDATE_SESSION_MANAGER, SessionManagerAction, UPDATE_SUGGESTED_TIMETABLE, SuggestionAction } from '../actions';
import { baseState } from '../state';
import { Meta } from '../state/Meta';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import SessionPlacement from '../components/Timetable/SessionPlacement';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('timetable reducer', () => {
  it('initialises correctly', () => {
    const state = timetable(undefined, otherAction);
    expect(state).toEqual(baseState.timetable);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = { ...baseState.timetable };
    const result = timetable(state, otherAction);
    expect(result).toBe(state);
    expect(state).toEqual(baseState.timetable);
  })

  it('can be set', () => {
    const initialTimetable = { ...baseState.timetable };
    const s = new SessionManager();
    s.update([], [], 10);
    const newData = s.data;
    const action: SessionManagerAction = {
      type: UPDATE_SESSION_MANAGER,
      sessionManager: newData,
    };
    const state = timetable(initialTimetable, action);
    expect(initialTimetable).toEqual(baseState.timetable);
    expect(state).toBe(newData);
    expect(state).toEqual(s.data);
  })
})

describe('suggestionScore reducer', () => {
  it('initialises correctly', () => {
    const state = suggestionScore(undefined, otherAction);
    expect(state).toEqual(baseState.suggestionScore);
  })

  it('doesn\'t change on no-op actions', () => {
    const states = [baseState.suggestionScore, null, 0, -1, 1000];
    for (const state of states) {
      const result = suggestionScore(state, otherAction);
      expect(result).toBe(state);
    }
  })

  it('can be set when null', () => {
    const initial = null;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 0,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(0);
  })

  it('can be set when zero', () => {
    const initial = 0;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 10,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(10);
  })

  it('can be set when non-zero', () => {
    const initial = 123;
    const action: SuggestionAction = {
      type: UPDATE_SUGGESTED_TIMETABLE,
      score: 1,
    };
    const state = suggestionScore(initial, action);
    expect(state).toBe(1);
  })
})

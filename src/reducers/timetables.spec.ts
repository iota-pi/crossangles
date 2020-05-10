import { timetables, suggestionScore } from './timetables';
import { ClearNoticeAction, CLEAR_NOTICE, UPDATE_SESSION_MANAGER, SessionManagerAction, UPDATE_SUGGESTED_TIMETABLE, SuggestionAction } from '../actions';
import { initialState } from '../state';
import SessionManager from '../components/Timetable/SessionManager';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('timetables reducer', () => {
  it('initialises correctly', () => {
    const state = timetables(undefined, otherAction);
    expect(state).toEqual(initialState.timetables);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = { ...initialState.timetables };
    const result = timetables(state, otherAction);
    expect(result).toBe(state);
    expect(state).toEqual(initialState.timetables);
  })

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
  })
})

describe('suggestionScore reducer', () => {
  it('initialises correctly', () => {
    const state = suggestionScore(undefined, otherAction);
    expect(state).toEqual(initialState.suggestionScore);
  })

  it('doesn\'t change on no-op actions', () => {
    const states = [initialState.suggestionScore, null, 0, -1, 1000];
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

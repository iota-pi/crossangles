import rootReducer from '.';
import { initialState } from '../state';

const NO_OP_ACTION = 'NO_OP_ACTION' as any;

describe('root reducer', () => {
  it('initialises correctly', () => {
    expect(rootReducer(undefined, NO_OP_ACTION)).toEqual(initialState);
  })

  it('doesn\'t change on a no-op action', () => {
    const state = { ...initialState };
    const history = state.history;
    const result = rootReducer(state, NO_OP_ACTION);
    expect(result).toBe(state);
    expect(result).toEqual(initialState);
    expect(result.history).toBe(history);
  })
})

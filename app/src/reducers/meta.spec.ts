import { meta } from './meta';
import { ClearNoticeAction, CLEAR_NOTICE, SET_META_DATA, MetaAction } from '../actions';
import { baseState } from '../state';
import { Meta } from '../state/Meta';

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE };

describe('meta reducer', () => {
  it('initialises correctly', () => {
    const state = meta(undefined, otherAction);
    expect(state).toEqual(baseState.meta);
  })

  it('doesn\'t change on no-op actions', () => {
    const state = { ...baseState.meta };
    const result = meta(state, otherAction);
    expect(result).toBe(state);
    expect(state).toEqual(baseState.meta);
  })

  it('can be set', () => {
    const testMeta = { ...baseState.meta };
    const newMeta: Meta = {
      ministryName: 'abc',
      ministryWebsite: 'abc',
      promoText: 'abc',
      signup: '',
      source: '',
      term: 1,
      updateDate: '',
      updateTime: '',
      year: 1984,
      signupURL: '',
      signupValidFor: [],
    };
    const action: MetaAction = {
      type: SET_META_DATA,
      meta: newMeta,
    };
    const state = meta(testMeta, action);
    expect(testMeta).toEqual(baseState.meta);
    expect(state).toEqual(newMeta);
  })
})

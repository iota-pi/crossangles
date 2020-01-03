import { SET_META_DATA, MetaAction } from '../actions/fetchData';
import { Meta, baseState } from '../state';
import { OtherAction } from '../actions';

export function meta(state: Meta | undefined, action: MetaAction | OtherAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }

  return state || baseState.meta;
}

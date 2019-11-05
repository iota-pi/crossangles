import { SET_META_DATA, MetaAction } from '../actions/fetch';
import { Meta, baseMeta } from '../state';

export function meta(state = baseMeta, action: MetaAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }
  return state;
}

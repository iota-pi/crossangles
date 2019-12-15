import { SET_META_DATA, MetaAction } from '../actions/fetchData';
import { Meta, baseMeta } from '../state';
import { OtherAction } from '../actions';

export function meta(state = baseMeta, action: MetaAction | OtherAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }
  return state;
}

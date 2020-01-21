import { SET_META_DATA, MetaAction } from '../actions/fetchData';
import { OtherAction } from '../actions';
import { baseState } from '../state';
import { Meta } from '../state/Meta';

export function meta(state: Meta | undefined, action: MetaAction | OtherAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta;
  }

  return state || baseState.meta;
}

import { createTransform } from 'redux-persist';
import { StateHistory } from './state/StateHistory';

export const historyTransform = createTransform(
  (inboundState: StateHistory) => {
    return {
      past: [],
      present: inboundState.present,
      future: [],
    };
  },
  (outboundState: StateHistory) => {
    return outboundState;
  },
  { whitelist: ['history'] },
);

export const noticeTransform = createTransform(
  () => null,
  () => null,
  { whitelist: ['notice'] },
);

export default [historyTransform, noticeTransform];

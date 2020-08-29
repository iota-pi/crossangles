import { createTransform } from 'redux-persist';
import { HistoryData } from './state';

export const historyTransform = createTransform(
  (inboundState: HistoryData) => ({
    past: [],
    present: inboundState.present,
    future: [],
  }),
  (outboundState: HistoryData) => outboundState,
  { whitelist: ['history'] },
);

export const noticeTransform = createTransform(
  () => null,
  () => null,
  { whitelist: ['notice'] },
);

export default [historyTransform, noticeTransform];

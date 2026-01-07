import { createTransform } from 'redux-persist'
import { HistoryData } from './state'

export const historyTransform = createTransform(
  (inboundState: HistoryData) => ({
    past: [],
    present: inboundState.present,
    future: [],
  }),
  (outboundState: HistoryData) => outboundState,
  { whitelist: ['history'] },
)

export const noticeTransform = createTransform(
  () => null,
  () => null,
  { whitelist: ['notice'] },
)

export const changelogViewTransform = createTransform(
  (inboundState: Date) => inboundState.toString(),
  (outboundState: string) => new Date(outboundState),
  { whitelist: ['changelogView'] },
)

export default [historyTransform, noticeTransform, changelogViewTransform]

import { SessionId } from '../../state'
import { SessionPlacementData } from './SessionPlacement'

export type SessionManagerEntriesData = Array<[SessionId, SessionPlacementData]>

export interface SessionManagerData {
  map: SessionManagerEntriesData,
  order: SessionId[],
  renderOrder: SessionId[],
  version: number,
  score: number,
}

export const getEmptySessionManagerData = (): SessionManagerData => ({
  map: [],
  order: [],
  renderOrder: [],
  score: 0,
  version: 0,
})

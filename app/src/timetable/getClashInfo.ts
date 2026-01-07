import { LinkedSession, LinkedStream, SessionData } from '../state'

export type ClashInfo = Map<LinkedStream, Map<LinkedStream, number>>

const ALLOWED_CLASH_MULTIPLIER = 0.5

export function getClashInfo(streams: LinkedStream[]): ClashInfo {
  const clashes = new Map<LinkedStream, Map<LinkedStream, number>>()
  for (let i = 0; i < streams.length; ++i) {
    const s1 = streams[i]
    const childMap = new Map<LinkedStream, number>()
    for (let j = 0; j < streams.length; ++j) {
      if (i === j) continue

      const s2 = streams[j]
      const clashHours = streamClashLength(s1, s2)
      childMap.set(s2, clashHours)
    }
    clashes.set(s1, childMap)
  }

  return clashes
}

export function streamClashLength(a: LinkedStream, b: LinkedStream) {
  let total = 0

  for (const s1 of a.sessions) {
    for (const s2 of b.sessions) {
      total += sessionClashLength(s1, s2)
    }
  }

  return total
}

export function sessionClashLength(
  a: LinkedSession | SessionData,
  b: LinkedSession | SessionData,
): number {
  if (a.day !== b.day) return 0

  const length = Math.max(Math.min(a.end, b.end) - Math.max(a.start, b.start), 0)
  return length * (a.canClash || b.canClash ? ALLOWED_CLASH_MULTIPLIER : 1)
}

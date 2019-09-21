import { Stream, Session, ILinkedSession } from "../state";

export type ClashInfo = Map<Stream, Map<Stream, number>>;

const ALLOWED_CLASH_MULTIPLIER = 0.5;

export const getClashInfo = (streams: Stream[]): ClashInfo => {
  const clashes = new Map<Stream, Map<Stream, number>>();
  for (let i = 0; i < streams.length; ++i) {
    const s1 = streams[i];
    const childMap = new Map<Stream, number>();
    for (let j = 0; j < streams.length; ++j) {
      if (i === j) continue;

      const s2 = streams[j];
      const clashHours = streamClashLength(s1, s2);
      childMap.set(s2, clashHours);
    }
    clashes.set(s1, childMap);
  }

  return clashes;
}

export const streamClashLength = (a: Stream, b: Stream) => {
  let total = 0;

  for (let s1 of a.sessions) {
    for (let s2 of b.sessions) {
      total += sessionClashLength(s1, s2);
    }
  }

  return total;
}

export const sessionClashLength = (a: Session | ILinkedSession, b: Session | ILinkedSession): number => {
  if (a.day === b.day) {
    const length = Math.max(Math.min(a.end, b.end) - Math.max(a.start, b.start), 0);
    return length * (a.canClash || b.canClash ? ALLOWED_CLASH_MULTIPLIER : 1);
  } else {
    return 0;
  }
}

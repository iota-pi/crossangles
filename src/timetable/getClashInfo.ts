import { Component } from "./coursesToComponents";
import { Session, Stream } from "../state";

export type ClashInfo = Map<Session, [Session, number][]>;

export const getClashInfo = (components: Component[]): ClashInfo => {
  const streams = components.reduce((all, c) => all.concat(c.streams), [] as Stream[]);
  const sessions = streams.reduce((all, s) => all.concat(s.sessions), [] as Session[]);

  const clashes = new Map<Session, [Session, number][]>();
  const seenSessions: Session[] = [];
  for (let session of sessions) {
    // Check for all clashes this session has with previous sessions
    const clashingSessions = seenSessions.filter(s => doesClash(session, s));
    clashes.set(session, clashingSessions.map(s => [s, clashLength(session, s)]));
    for (let clashingSession of clashingSessions) {
      const initialValue = clashes.get(clashingSession) || [];
      const newValue: [Session, number] = [session, clashLength(session, clashingSession)]
      clashes.set(clashingSession, initialValue.concat([newValue]));
    }

    seenSessions.push(session);
  }

  return clashes;
}

const doesClash = (a: Session, b: Session): boolean => {
  return a.day === b.day && (a.start < b.end) && (b.start < a.end);
}

const clashLength = (a: Session, b: Session): number => {
  if (doesClash(a, b)) {
    return Math.max(0, a.end - b.start, b.end - a.start);
  } else {
    return 0;
  }
}

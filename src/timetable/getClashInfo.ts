import { Component } from "./coursesToComponents";
import { Session, Stream } from "../state";

export const getClashInfo = (components: Component[]): Map<Session, Session[]> => {
  const streams = components.reduce((all, c) => all.concat(c.streams), [] as Stream[]);
  const sessions = streams.reduce((all, s) => all.concat(s.sessions), [] as Session[]);

  const clashes = new Map<Session, Session[]>();
  const seenSessions: Session[] = [];
  for (let session of sessions) {
    // Check for all clashes this session has with previous sessions
    const clashingSessions = seenSessions.filter(s => doesClash(session, s));
    clashes.set(session, clashingSessions);
    for (let clashingSession of clashingSessions) {
      clashes.set(clashingSession, (clashes.get(clashingSession) || []).concat(session));
    }

    seenSessions.push(session);
  }

  return clashes;
}

const doesClash = (a: Session, b: Session) => {
  return a.day === b.day && (a.start < b.end) && (b.start < a.end);
}

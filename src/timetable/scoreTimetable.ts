import { Session, Timetable } from '../state';
import { notUndefined } from '../typeHelpers';
import { ClashInfo } from './getClashInfo';

export const scoreTimetable = (
  timetable: Timetable,
  pastTimetable: Timetable,
  clashInfo: ClashInfo
): number => {
  // Perf note: could reduce number of iterations through timetable by combining these methods
  // (probably not worth the performance gain though..?)
  let score = 0;
  score += scoreClashes(timetable, clashInfo);
  score += scoreFreeDays(timetable);
  score += scoreTimes(timetable);
  score += scoreDayLength(timetable);
  score += scoreUnchanged(timetable, pastTimetable);

  return score;
}

export const scoreFreeDays = (sessions: Session[]): number => {
  const freeDayValues = { M: 190, T: 150, W: 180, H: 160, F: 200 };

  for (let session of sessions) {
    freeDayValues[session.day] = 0;
  }

  return Object.values(freeDayValues).reduce((sum, x) => sum + x, 0);
}

export const scoreTimes = (sessions: Session[]): number => {
  return sessions.reduce((sum, { start, end }) => {
    const scoreStart = -((start - 14) * (start - 14)) + 9;
    const scoreEnd = -((end - 14) * (end - 14)) + 9;
    return sum + Math.min(scoreStart, scoreEnd, 0);
  }, 0);
}

export const scoreDayLength = (sessions: Session[]): number => {
  const perHour = -10;
  const dayLengths = {
    M: [0, 24],
    T: [0, 24],
    W: [0, 24],
    H: [0, 24],
    F: [0, 24],
  };

  for (let session of sessions) {
    const day = dayLengths[session.day];
    if (session.start > day[0]) {
      day[0] = session.start;
    }
    if (session.end > day[1]) {
      day[1] = session.end;
    }
  }

  return Object.values(dayLengths).reduce((sum, [start, end]) => sum + end - start, 0) * perHour;
}

export const scoreUnchanged = (current: Timetable, past: Timetable): number => {
  const perUnchangedSession = 30;
  // Perf note: could use a Set for faster inclusion checking
  return current.reduce((sum, curr) => sum + (past.includes(curr) ? perUnchangedSession : 0), 0);
}

export const scoreClashes = (sessions: Session[], clashInfo: ClashInfo): number => {
  const clashPenalty = -300;
  const permittedClashPenalty = -150;
  return sessions.reduce((sum, s) => {
    const penalty = s.canClash ? permittedClashPenalty : clashPenalty;
    const clashes = notUndefined(clashInfo.get(s));
    const clashHours = clashes.reduce((sum, c) => sum + c[1], 0);
    return sum + clashHours * penalty;
  }, 0);
}

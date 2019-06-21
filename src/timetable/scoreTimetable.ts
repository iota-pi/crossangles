import { Session, Timetable } from '../state';
import { notUndefined } from '../typeHelpers';

export const scoreTimetable = (
  timetable: Timetable,
  pastTimetable: Timetable | null,
  clashInfo: Map<Session, Session[]>
): number => {
  // Perf note: could reduce number of iterations through timetable by combining these methods
  // (probably not worth the performance gain though..?)
  let score = scoreClashes(timetable, clashInfo);
  score += scoreFreeDays(timetable);
  score += scoreTimes(timetable);
  score += scoreDayLength(timetable);

  if (pastTimetable !== null) {
    score += scoreUnchanged(timetable, pastTimetable);
  }

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

export const scoreClashes = (sessions: Session[], clashInfo: Map<Session, Session[]>): number => {
  const clashPenalty = -300;
  const permittedClashPenalty = -150;
  return sessions.reduce((sum, s) => {
    const penalty = s.canClash ? permittedClashPenalty : clashPenalty;
    return sum + notUndefined(clashInfo.get(s)).length * penalty;
  }, 0);
}

// const EARLIEST_START = 8;

// function timetableToArray (timetableData: Stream[]) {
//   let timetable: Session[][][] = [ [], [], [], [], [] ]
//   let clashAllowances: boolean[][][] = [ [], [], [], [], [] ]
//   const dayOfWeek = ['M', 'T', 'W', 'H', 'F']

//   // Convert to timetable array
//   for (let i = 0; i < timetableData.length; i++) {
//     let sessions = timetableData[i].sessions;
//     for (let j = 0; j < sessions.length; j++) {
//       let session = sessions[j];
//       let canClash = session.canClash || false;
//       let day = dayOfWeek.indexOf(session.day);
//       let start = (session.start - EARLIEST_START) * 2;
//       let end = start + (session.end - session.start) * 2;
//       for (let h = start; h < end; h++) {
//         // Initialise to blank array if required
//         if (timetable[day][h] === undefined) {
//           timetable[day][h] = [ session ];
//           clashAllowances[day][h] = [ canClash ];
//         } else {
//           // Add this course to the list of courses in this half-hour slot
//           timetable[day][h].push(session);
//           clashAllowances[day][h].push(canClash);
//         }
//       }
//     }
//   }

//   return [timetable, clashAllowances];
// }

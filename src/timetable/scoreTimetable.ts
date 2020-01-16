import { notUndefined } from '../typeHelpers';
import { ClashInfo } from './getClashInfo';
import TimetableScorerCache from './TimetableScorerCache';
import { LinkedSession } from '../state/Session';
import { LinkedStream } from '../state/Stream';

export const MIN_SCORE_TO_PROMPT = 50;

export interface TimetableScore {
  score: number,
  timetable: LinkedSession[],
}

export class TimetableScorer {
  private fixedSessions: LinkedSession[];
  private clashInfo: ClashInfo;
  private fewestClashes: number;
  private cache: TimetableScorerCache<number>;

  constructor (fixedSessions: LinkedSession[], clashInfo: ClashInfo) {
    this.fixedSessions = fixedSessions;
    this.clashInfo = clashInfo;
    this.fewestClashes = Infinity;
    this.cache = new TimetableScorerCache();
  }

  score (streams: LinkedStream[], indexes: number[]): number {
    const cachedScore = this.cache.get(indexes);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    const clashes = countClashes(streams, this.clashInfo, this.fewestClashes);

    // Quick exit for timetables with more clashes than a previously found timetable
    if (clashes > this.fewestClashes) {
      return -Infinity;
    } else {
      this.fewestClashes = clashes;
    }

    const timetable = streams.flatMap(s => s.sessions).concat(this.fixedSessions);
    let score = 0;
    score += scoreClashes(clashes);
    score += scoreFreeDays(timetable);
    score += scoreTimes(timetable);
    score += scoreDayLength(timetable);

    this.cache.set(indexes, score);
    return score;
  }
}

export const scoreFreeDays = (sessions: LinkedSession[]): number => {
  const scores = { M: 290, T: 250, W: 280, H: 260, F: 300 };

  for (let i = 0; i < sessions.length; ++i) {
    scores[sessions[i].day] = 0;
  }

  return scores.M + scores.T + scores.W + scores.H + scores.F;
}

export const scoreTimes = (sessions: LinkedSession[]): number => {
  let total = 0;

  for (let i = 0; i < sessions.length; ++i) {
    const { start, end } = sessions[i];
    const scoreStart = -((start - 14) * (start - 14)) + 9;
    const scoreEnd = -((end - 14) * (end - 14)) + 9;
    total += Math.min(scoreStart, scoreEnd, 0);
  }

  return total;
}

export const scoreDayLength = (sessions: LinkedSession[]): number => {
  const perHour = -10;
  const starts = { M: 24, T: 24, W: 24, H: 24, F: 24 };
  const ends = { M: -1, T: -1, W: -1, H: -1, F: -1 };

  for (let i = 0; i < sessions.length; ++i) {
    const { day, start, end } = sessions[i];
    if (start < starts[day]) {
      starts[day] = start;
    }
    if (end > ends[day]) {
      ends[day] = end;
    }
  }

  let total = 0;
  if (ends.M > -1) total += ends.M - starts.M;
  if (ends.T > -1) total += ends.T - starts.T;
  if (ends.W > -1) total += ends.W - starts.W;
  if (ends.H > -1) total += ends.H - starts.H;
  if (ends.F > -1) total += ends.F - starts.F;

  return total * perHour;
}

export const countClashes = (
  streams: LinkedStream[],
  clashInfo: ClashInfo,
  maxClash: number,
): number => {
  let count = 0;

  for (let i = 0; i < streams.length; ++i) {
    const s1 = streams[i];
    const innerMap = notUndefined(clashInfo.get(s1));
    for (let j = i + 1; j < streams.length; ++j) {
      const s2 = streams[j];
      count += notUndefined(innerMap.get(s2));
      if (count > maxClash) {
        return maxClash + 1;
      }
    }
  }

  return count;
}

export const scoreClashes = (counts: number): number => {
  const clashPenalty = -1000;
  return counts * clashPenalty;
}

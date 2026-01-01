import { notUndefined } from '../typeHelpers';
import { ClashInfo } from './getClashInfo';
import { TimetableScorerCache } from './TimetableScorerCache';
import { ALL_DAYS, DayLetter, LinkedSession, LinkedStream } from '../state';

export interface TimetableScore {
  score: number,
  timetable: LinkedSession[],
}

export interface TimetableScoreConfig {
  clash: number,
  freeDays: number,
  times: number,
  dayLength: number,
}

export const defaultScoreConfig: TimetableScoreConfig = {
  clash: 1,
  freeDays: 1,
  times: 1,
  dayLength: 1,
};

export class TimetableScorer {
  private fixedSessions: LinkedSession[];
  private clashInfo: ClashInfo;
  private fewestClashes: number;
  private cache: TimetableScorerCache<number>;
  private customWeights: TimetableScoreConfig;

  constructor(clashInfo: ClashInfo, fixedSessions: LinkedSession[]) {
    this.fixedSessions = fixedSessions;
    this.clashInfo = clashInfo;
    this.fewestClashes = Infinity;
    this.cache = new TimetableScorerCache();
    this.customWeights = { ...defaultScoreConfig };
  }

  score(streams: LinkedStream[], cacheKey?: number[]): number {
    if (cacheKey !== undefined) {
      const cachedScore = this.cache.get(cacheKey);
      if (cachedScore !== undefined) {
        return cachedScore;
      }
    }

    const clashes = countClashes(streams, this.clashInfo, this.fewestClashes);

    // Quick exit for timetables with more clashes than a previously found timetable
    if (clashes > this.fewestClashes) {
      return -Infinity;
    }
    this.fewestClashes = clashes;

    const timetable = streams.flatMap(s => s.sessions).concat(this.fixedSessions);
    let score = 0;
    score += scoreClashes(clashes) * this.customWeights.clash;
    score += scoreFreeDays(timetable) * this.customWeights.freeDays;
    score += scoreTimes(timetable) * this.customWeights.times;
    score += scoreDayLength(timetable) * this.customWeights.dayLength;
    score += scoreGGAndTBTDays(timetable);

    if (cacheKey) {
      this.cache.set(cacheKey, score);
    }

    return score;
  }

  updateConfig(newConfig: TimetableScoreConfig) {
    this.customWeights = newConfig;
    this.cache.clear();
  }
}

export function scoreFreeDays(sessions: LinkedSession[]): number {
  const scores = { M: 290, T: 250, W: 280, H: 260, F: 300, S: 310, s: 310 };

  for (let i = 0; i < sessions.length; ++i) {
    scores[sessions[i].day] = 0;
  }

  return scores.M + scores.T + scores.W + scores.H + scores.F + scores.S + scores.s;
}

export function scoreTimes(sessions: LinkedSession[]): number {
  let total = 0;

  for (let i = 0; i < sessions.length; ++i) {
    const { start, end } = sessions[i];
    const scoreStart = -((start - 14) * (start - 14)) + 9;
    const scoreEnd = -((end - 14) * (end - 14)) + 9;
    total += Math.min(scoreStart, scoreEnd, 0);
  }

  return total;
}

export function scoreDayLength(sessions: LinkedSession[]): number {
  const perHour = -10;
  const starts = Object.fromEntries(ALL_DAYS.map(day => [day, 24]));
  const ends = Object.fromEntries(ALL_DAYS.map(day => [day, -1]));

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

export function scoreGGAndTBTDays(sessions: LinkedSession[]) {
  let tbtDay: DayLetter | null = null;
  let ggDay: DayLetter | null = null;

  for (let i = 0; i < sessions.length; ++i) {
    const s = sessions[i];
    if (s.course.code === 'CBS') {
      if (s.stream.component === 'The Bible Talks') {
        tbtDay = s.day;
        if (ggDay) {
          break;
        }
      } else if (s.stream.component === 'Growth Groups') {
        ggDay = s.day;
        if (tbtDay) {
          break;
        }
      }
    }
  }

  return tbtDay && ggDay && tbtDay === ggDay ? 100 : 0;
}

export function countClashes(
  streams: LinkedStream[],
  clashInfo: ClashInfo,
  maxClash: number,
): number {
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

export function scoreClashes(counts: number): number {
  const clashPenalty = -1000;
  return counts * clashPenalty;
}

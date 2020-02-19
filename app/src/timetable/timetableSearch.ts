import { TimetableScorer } from './scoreTimetable';
import { getClashInfo } from './getClashInfo';
import { GeneticSearch, GeneticSearchOptionalConfig } from './GeneticSearch';
import { Component } from './coursesToComponents';
import { LinkedStream } from '../state/Stream';
import { LinkedSession } from '../state/Session';

export interface TimetableSearchResult {
  timetable: LinkedSession[],
  score: number,
  unplaced?: LinkedSession[],
}

class TimetableSearch {
  private cache = new Map<string, TimetableSearchResult>();

  search (
    components: Component[],
    fixedSessions: LinkedSession[],
    maxSpawn = 3,
    ignoreCache = false,
    config: GeneticSearchOptionalConfig = {},
  ): TimetableSearchResult {
    const componentIds = components.map(c => c.id).join('~~~');
    const fixedSessionsIds = fixedSessions.map(s => s.id).join('~~~');
    const cacheKey = `${componentIds}//${fixedSessionsIds}`;
    if (!ignoreCache) {
      const cachedTimetable = this.cache.get(cacheKey);
      if (cachedTimetable !== undefined) {
        return cachedTimetable;
      }
    }

    // Pre-compute clash info and set of previous timetable's sessions
    const allStreams = components.reduce((all, c) => all.concat(c.streams), [] as LinkedStream[]);
    const clashInfo = getClashInfo(allStreams);

    // Set up scorer and searcher
    // TODO: could improve performance by spawning in multiple web workers
    const scorer = new TimetableScorer(clashInfo, fixedSessions);
    const searchers = new Array(maxSpawn).fill(0).map(_ => new GeneticSearch({
      ...config,
      maxTime: (config.maxTime || 500) / maxSpawn,
      scoreFunction: scorer.score.bind(scorer),
    }));

    // Break components into streams
    const streams = components.map(c => c.streams);

    // Perform search
    const results = searchers.map(s => s.search(streams));
    const best = results.sort((a, b) => b.score - a.score)[0];

    // Return best result as list of sessions
    const timetable = ([] as LinkedSession[]).concat(...best.values.map(s => s.sessions));
    const score = best.score;
    const result = { timetable, score };
    this.cache.set(cacheKey, result);
    return result;
  }
}

const searcher = new TimetableSearch();

export const search = searcher.search.bind(searcher);

import { getClashInfo } from './getClashInfo';
import { GeneticSearchOptionalConfig, Parent } from './GeneticSearch';
import { Component } from './coursesToComponents';
import { LinkedStream } from '../state/Stream';
import { LinkedSession } from '../state/Session';

// eslint-disable-next-line import/no-webpack-loader-syntax
import createSearchWorker, { Workerized } from 'workerize-loader!./search.worker';
import * as searchWorker from './search.worker';

export interface TimetableSearchResult {
  timetable: LinkedSession[],
  score: number,
  unplaced?: LinkedSession[],
}

class TimetableSearch {
  private cache = new Map<string, TimetableSearchResult>();

  async search (
    components: Component[],
    fixedSessions: LinkedSession[],
    maxSpawn = 5,
    ignoreCache = false,
    config: GeneticSearchOptionalConfig = {},
  ): Promise<TimetableSearchResult> {
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

    // Break components into streams
    const streams = components.map(c => c.streams);

    const workers: Workerized<typeof searchWorker>[] = [];
    for (let i = 0; i < maxSpawn; ++i) {
      const worker = createSearchWorker<typeof searchWorker>();
      workers.push(worker);
    }

    const promises: Promise<Parent<LinkedStream>>[] = [];
    for (const worker of workers) {
      promises.push(worker.runSearch({
        clashInfo,
        config,
        fixedSessions,
        streams,
      }));
    }
    const results = await Promise.all(promises);

    for (const worker of workers) {
      worker.terminate();
    }

    // Find best result
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

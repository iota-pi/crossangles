import { getClashInfo, ClashInfo } from './getClashInfo';
import { GeneticSearchOptionalConfig, Parent } from './GeneticSearch';
import { Component } from './coursesToComponents';
import { LinkedStream } from '../state/Stream';
import { LinkedSession } from '../state/Session';

// eslint-disable-next-line import/no-webpack-loader-syntax
import createSearchWorker, { Workerized } from 'workerize-loader!./search.worker';
import * as searchWorker from './search.worker';

export type Worker = Workerized<typeof searchWorker>;

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
    const cacheKey = this.getCacheKey(components, fixedSessions);
    if (!ignoreCache) {
      const cachedTimetable = this.cache.get(cacheKey);
      if (cachedTimetable !== undefined) {
        return cachedTimetable;
      }
    }

    const spawnWorkersPromise = this.spawnWorkers(maxSpawn);

    const clashInfo = await this.getClashInfo(components);
    const streams = components.map(c => c.streams);

    const workers = await spawnWorkersPromise;

    const results = await this.runSearchInWorkers({
      workers,
      fixedSessions,
      clashInfo,
      streams,
      config,
    });

    // Asynchronously terminate workers
    this.terminateWorkers(workers);

    // Find best result
    const best = results.sort((a, b) => b.score - a.score)[0];

    // Return best result as list of sessions
    const timetable = ([] as LinkedSession[]).concat(...best.values.map(s => s.sessions));
    const score = best.score;
    const result = { timetable, score };
    this.cache.set(cacheKey, result);
    return result;
  }

  private getCacheKey (components: Component[], fixedSessions: LinkedSession[]) {
    const componentIds = components.map(c => c.id).join('~~~');
    const fixedSessionsIds = fixedSessions.map(s => s.id).join('~~~');
    const cacheKey = `${componentIds}//${fixedSessionsIds}`;
    return cacheKey;
  }

  private async getClashInfo (components: Component[]): Promise<ClashInfo> {
    const allStreams = components.reduce((all, c) => all.concat(c.streams), [] as LinkedStream[]);
    const clashInfo = getClashInfo(allStreams);
    return clashInfo;
  }

  private async spawnWorkers (count: number) {
    const workers: Worker[] = [];
    for (let i = 0; i < count; ++i) {
      const worker = createSearchWorker<typeof searchWorker>();
      workers.push(worker);
    }
    return workers;
  }

  private async runSearchInWorkers ({
    workers,
    fixedSessions,
    clashInfo,
    streams,
    config,
  }: {
    workers: Worker[],
    fixedSessions: LinkedSession[],
    clashInfo: ClashInfo,
    streams: LinkedStream[][],
    config: GeneticSearchOptionalConfig,
  }): Promise<Parent<LinkedStream>[]> {
    const promises: Promise<Parent<LinkedStream>>[] = [];
    for (const worker of workers) {
      promises.push(worker.runSearch({
        fixedSessions,
        clashInfo,
        streams,
        config,
      }));
    }
    return await Promise.all(promises);
  }

  private async terminateWorkers (workers: Worker[]) {
    for (const worker of workers) {
      worker.terminate();
    }
  }
}

const searcher = new TimetableSearch();

export const search = searcher.search.bind(searcher);

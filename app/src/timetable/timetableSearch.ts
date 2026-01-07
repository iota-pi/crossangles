import { GeneticSearchOptionalConfig, Parent } from './GeneticSearch'
import { Component } from './coursesToComponents'
import { LinkedSession, LinkedStream } from '../state'
import { getClashInfo, ClashInfo } from './getClashInfo'
import { TimetableScoreConfig } from './scoreTimetable'
import SearchWorker from './search.worker?worker'
import type { RunSearchOptions } from './search.worker'

export interface TimetableSearchResult {
  timetable: LinkedSession[],
  score: number,
  unplaced?: LinkedSession[],
}


class TimetableSearch {
  private cache = new Map<string, TimetableSearchResult>()
  private workers: Worker[] = []

  constructor(workerCount = 5) {
    this.spawnWorkers(workerCount)
  }

  async search(
    components: Component[],
    fixedSessions: LinkedSession[],
    ignoreCache = true,
    config: GeneticSearchOptionalConfig = {},
    scoreConfig?: TimetableScoreConfig,
    maxSpawn?: number,
  ): Promise<TimetableSearchResult> {
    const cacheKey = this.getCacheKey(components, fixedSessions)
    if (!ignoreCache) {
      const cachedTimetable = this.cache.get(cacheKey)
      if (cachedTimetable !== undefined) {
        return cachedTimetable
      }
    }

    const clashInfo = this.clashInfoFromComponents(components)
    const streams = components.map(c => c.streams)
    const results = await this.runSearchInWorkers({
      clashInfo,
      config,
      fixedSessions,
      maxSpawn,
      streams,
      scoreConfig,
    })

    // Find best result
    const best = results.sort((a, b) => b.score - a.score)[0]

    // Return best result as list of sessions
    const timetable = ([] as LinkedSession[]).concat(...best.values.map(s => s.sessions))
    const score = best.score
    const result = { timetable, score }
    this.cache.set(cacheKey, result)
    return result
  }

  private getCacheKey(components: Component[], fixedSessions: LinkedSession[]) {
    const componentIds = components.map(c => c.id).join('~~~')
    const fixedSessionsIds = fixedSessions.map(s => s.id).join('~~~')
    const cacheKey = `${componentIds}//${fixedSessionsIds}`
    return cacheKey
  }

  private async spawnWorkers(count: number) {
    for (let i = 0; i < count; ++i) {
      const worker = new SearchWorker()
      this.workers.push(worker)
    }
  }

  private runSearchInWorkers({
    fixedSessions,
    clashInfo,
    streams,
    config,
    scoreConfig,
    maxSpawn,
  }: {
    fixedSessions: LinkedSession[],
    clashInfo: ClashInfo,
    streams: LinkedStream[][],
    config: GeneticSearchOptionalConfig,
    scoreConfig?: TimetableScoreConfig,
    maxSpawn?: number,
  }): Promise<Parent<LinkedStream>[]> {
    const promises: Promise<Parent<LinkedStream>>[] = []
    const workers = maxSpawn ? this.workers.slice(0, maxSpawn) : this.workers
    for (const worker of workers) {
      promises.push(new Promise<Parent<LinkedStream>>(resolve => {
        const options: RunSearchOptions = {
          fixedSessions,
          clashInfo,
          streams,
          config,
          scoreConfig,
        }
        worker.postMessage(options)
        worker.onmessage = event => resolve(event.data)
      }))
    }
    return Promise.all(promises)
  }

  private clashInfoFromComponents(components: Component[]) {
    const allStreams = components.reduce((all, c) => all.concat(c.streams), [] as LinkedStream[])
    return getClashInfo(allStreams)
  }

  private async terminateWorkers() {
    for (const worker of this.workers) {
      worker.terminate()
    }
    this.workers = []
  }
}

const searcher = new TimetableSearch()
export const search = searcher.search.bind(searcher)

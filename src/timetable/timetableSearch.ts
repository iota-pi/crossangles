import { Component, TimetableScorer, getClashInfo, GeneticSearch } from '.';
import { Stream, ILinkedSession, LinkedTimetable } from '../state';

class TimetableSearch {
  private cache = new Map<string, LinkedTimetable>();

  search (
    components: Component[],
    fixedSessions: ILinkedSession[],
    maxTime = 300,
    maxSpawn = 3,
  ): LinkedTimetable {
    const componentIds = components.map(c => `${c.course}-${c.name}`).join(',');
    const cachedTimetable = this.cache.get(componentIds);
    if (cachedTimetable !== undefined) {
      return cachedTimetable;
    }

    // Pre-compute clash info and set of previous timetable's sessions
    const allStreams = components.reduce((all, c) => all.concat(c.streams), [] as Stream[]);
    const clashInfo = getClashInfo(allStreams);

    // Set up scorer and searcher
    // TODO: could increase performance by spawning in multiple web workers
    const scorer = new TimetableScorer(fixedSessions, clashInfo);
    const searchers = new Array(maxSpawn).fill(0).map(_ => new GeneticSearch({
      maxTime: maxTime / maxSpawn,
      scoreFunction: scorer.score.bind(scorer),
      maxIterations: 5000,
      initialParents: 100,
      maxParents: 20,
      biasTop: 5,
    }));

    // Break components into streams
    const streams = components.map(c => c.streams);

    // Perform search
    const results = searchers.map(s => s.search(streams));
    const best = results.sort((a, b) => b.score - a.score)[0];

    // Return best result as list of sessions
    const sessions = ([] as ILinkedSession[]).concat(...best.values.map(s => s.sessions));
    this.cache.set(componentIds, sessions);
    return sessions;
  }
}

const searcher = new TimetableSearch();

export const search = searcher.search.bind(searcher);

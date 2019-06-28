import { Component, TimetableScorer, getClashInfo, GeneticSearch } from '.';
import { Timetable, Session, Stream } from '../state';

export function search (
  components: Component[],
  lastTimetable: Timetable,
  maxTime = 500,
  maxSpawn = 5,
): Timetable {
  // Pre-compute clash info and set of previous timetable's sessions
  const allStreams = components.reduce((all, c) => all.concat(c.streams), [] as Stream[]);
  const clashInfo = getClashInfo(allStreams);

  // Set up scorer and searcher
  // TODO: could increase performance by spawning in multiple web workers
  const scorer = new TimetableScorer(lastTimetable, clashInfo);
  const searchers = new Array(maxSpawn).fill(0).map(_ => new GeneticSearch({
    maxTime: maxTime / maxSpawn,
    scoreFunction: scorer.score.bind(scorer),
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
  const sessions = ([] as Session[]).concat(...best.values.map(s => s.sessions));
  return sessions;
}

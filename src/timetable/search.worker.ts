import { LinkedStream } from '../state/Stream';
import { LinkedSession } from '../state/Session';
import { TimetableScorer } from './scoreTimetable';
import { GeneticSearch, GeneticSearchOptionalConfig } from './GeneticSearch';
import { ClashInfo } from './getClashInfo';

export interface RunSearchOptions {
  clashInfo: ClashInfo,
  fixedSessions: LinkedSession[],
  streams: LinkedStream[][],
  config: GeneticSearchOptionalConfig,
}


export const runSearch = ({
  clashInfo,
  fixedSessions,
  streams,
  config,
}: RunSearchOptions) => {
  console.log(Date.now())
  const time = performance.now();
  const scorer = new TimetableScorer(clashInfo, fixedSessions);
  const searcher = new GeneticSearch({
    ...config,
    scoreFunction: scorer.score.bind(scorer),
  });
  const result = searcher.search(streams)
  console.log('worker', performance.now() - time, Date.now());
  return result;
}

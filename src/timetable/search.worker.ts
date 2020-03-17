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
  const scorer = new TimetableScorer(clashInfo, fixedSessions);
  const searcher = new GeneticSearch({
    ...config,
    scoreFunction: scorer.score.bind(scorer),
  });
  const result = searcher.search(streams)
  return result;
}

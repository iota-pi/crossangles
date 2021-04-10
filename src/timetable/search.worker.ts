import { LinkedSession, LinkedStream } from '../state';
import { TimetableScorer, TimetableScoreConfig } from './scoreTimetable';
import { GeneticSearch, GeneticSearchOptionalConfig } from './GeneticSearch';
import { ClashInfo } from './getClashInfo';

export interface RunSearchOptions {
  clashInfo: ClashInfo,
  fixedSessions: LinkedSession[],
  streams: LinkedStream[][],
  config: GeneticSearchOptionalConfig,
  scoreConfig?: TimetableScoreConfig,
}


export function runSearch({
  clashInfo,
  fixedSessions,
  streams,
  config,
  scoreConfig,
}: RunSearchOptions) {
  const scorer = new TimetableScorer(clashInfo, fixedSessions);
  if (scoreConfig) scorer.updateConfig(scoreConfig);

  const searcher = new GeneticSearch({
    ...config,
    scoreFunction: scorer.score.bind(scorer),
  });
  const result = searcher.search(streams);
  return result;
}

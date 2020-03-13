import { TimetableScorer } from "./scoreTimetable";
import { ClashInfo } from "./getClashInfo";
import { LinkedSession } from "../state/Session";
import { GeneticSearch, GeneticSearchOptionalConfig } from "./GeneticSearch";
import { LinkedStream } from "../state/Stream";

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
  return searcher.search(streams);
}

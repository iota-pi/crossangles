import { matchSorter, MatchSorterOptions } from 'match-sorter';
import { CourseData } from '../../state';

export const matchSorterOptions: MatchSorterOptions = {
  keys: ['lowerCode', 'name'],
  baseSort: (a, b) => +(a.rankedValue > b.rankedValue) - +(a.rankedValue < b.rankedValue),
};

export function runFilter(options: CourseData[], inputValue: string): CourseData[] {
  const query = inputValue.toLowerCase().trim();
  const results = matchSorter(options, query, matchSorterOptions);
  return results;
}

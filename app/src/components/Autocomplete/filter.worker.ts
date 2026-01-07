import { matchSorter, MatchSorterOptions } from 'match-sorter'
import type { CourseData } from '../../state'

export const matchSorterOptions: MatchSorterOptions<CourseData> = {
  keys: ['lowerCode', 'name'],
  baseSort: (a, b) => +(a.rankedValue > b.rankedValue) - +(a.rankedValue < b.rankedValue),
}

export function runFilter(options: CourseData[], inputValue: string): CourseData[] {
  const query = inputValue.toLowerCase().trim()
  const results = matchSorter<CourseData>(options, query, matchSorterOptions)
  return results
}

self.onmessage = (
  event: MessageEvent<{ options: CourseData[], inputValue: string }>,
) => {
  const { options, inputValue } = event.data
  const results = runFilter(options, inputValue)
  self.postMessage(results)
}

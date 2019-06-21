import { Component } from '.';
import { Timetable, Session } from '../state';
import { scoreTimetable } from './scoreTimetable';
import { getClashInfo } from './getClashInfo';

export type IndexTimetable = number[];

function shuffleArray<T> (array: T[]) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[j]
    array[j] = array[i]
    array[i] = temp
  }
  return array
}

function search (components: Component[], lastTimetable: Timetable | null): Timetable | null {
  const clashInfo = getClashInfo(components);

  let bestScore = -Infinity;
  let bestTimetable: Timetable | null = null;
  const timetable: IndexTimetable = (new Array(components.length)).fill(0)
  let i = 0;
  while (i < components.length) {
    if (timetable[i] === components[i].streams.length) {
      timetable[i] = 0;
      i++;
    } else {
      // Increment this element
      timetable[i]++;
      i = 0;

      // Score this timetable and compare with previous best
      const streams = components.map((c, i) => c.streams[timetable[i]]);
      const allSessions = streams.reduce((all, s) => all.concat(s.sessions), [] as Session[]);
      const score = scoreTimetable(allSessions, lastTimetable, clashInfo);
      if (score > bestScore) {
        bestScore = score;
        bestTimetable = allSessions;
      }
    }
  }

  return bestTimetable;
}

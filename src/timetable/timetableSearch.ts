import { Component } from '.';
import { Timetable, Session } from '../state';
import { scoreTimetable } from './scoreTimetable';
import { getClashInfo } from './getClashInfo';

export type IndexTimetable = number[];

export function search (components: Component[], lastTimetable: Timetable): Timetable | null {
  const clashInfo = getClashInfo(components);
  console.log(clashInfo);

  let bestScore = -Infinity;
  let bestTimetable: Timetable | null = null;
  const timetable: IndexTimetable = (new Array(components.length)).fill(0)
  timetable[0] = -1;
  let i = 0;
  while (i < components.length) {
    if (timetable[i] === components[i].streams.length - 1) {
      timetable[i] = 0;
      i++;
    } else {
      // Increment this element
      timetable[i]++;
      i = 0;

      // Score this timetable and compare with previous best
      const streams = components.map((c, i) => c.streams[timetable[i]]);
      console.log(streams, i, components, timetable);
      const allSessions = streams.reduce((all, s) => all.concat(s.sessions), [] as Session[]);
      const score = scoreTimetable(allSessions, lastTimetable, clashInfo);
      if (score > bestScore) {
        bestScore = score;
        bestTimetable = allSessions;
      }
    }
  }

  console.log('search() finished', bestTimetable, bestScore);

  return bestTimetable;
}

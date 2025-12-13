import { CourseData } from '../../app/src/state/Course';
import { ALL_DAYS, DayLetter } from '../../app/src/state/Session';
import { ClassTime, DeliveryType, StreamData } from '../../app/src/state/Stream';

export function removeDuplicateStreams(course: CourseData) {
  const mapping = getStreamGroupMapping(course);

  // For each set of streams with identical component and times, remove all but the emptiest stream
  for (const streamGroup of Array.from(mapping.values())) {
    // Get emptiest stream and merge data from other streams into it
    const bestStream: StreamData = emptiestStream(streamGroup);
    bestStream.delivery = mergeDeliveryType(streamGroup);
    const inPersonTimes = getInPersonTimes(streamGroup);
    if (inPersonTimes !== null) {
      bestStream.times = inPersonTimes;
    }
    bestStream.times = normaliseTimes(bestStream.times);

    // Remove all other streams
    for (const stream of streamGroup) {
      if (stream !== bestStream) {
        const index = course.streams.indexOf(stream);
        course.streams.splice(index, 1);
      }
    }
  }
}

function getStreamGroupMapping(course: CourseData): Map<string, StreamData[]> {
  const mapping = new Map<string, StreamData[]>();
  for (const stream of course.streams) {
    const times = stream.times.map(t => t.time);
    const key = `${stream.component}[${times}]`;
    const currentGroup = mapping.get(key) || [];
    const newGroup = currentGroup.concat(stream);
    mapping.set(key, newGroup);
  }
  return mapping;
}

function emptiestStream(streams: StreamData[]) {
  let bestStream = streams[0];
  let bestRatio = Infinity;
  for (const stream of streams) {
    if (stream.enrols) {
      const ratio = stream.enrols[0] / stream.enrols[1];
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestStream = stream;
      }
    }
  }

  return bestStream;
}

export function mergeDeliveryType(streams: StreamData[]): DeliveryType | undefined {
  // Merges delivery types of multiple streams
  let delivery: DeliveryType | undefined;
  for (const stream of streams) {
    if (stream.delivery !== undefined) {
      if (delivery === undefined) {
        delivery = stream.delivery;
      } else if (stream.delivery !== delivery) {
        delivery = DeliveryType.either;
        break;
      }
    }
  }
  return delivery;
}

export function getInPersonTimes(streams: StreamData[]): ClassTime[] | null {
  // NB: assumes a set of streams which have identical times and component
  for (const stream of streams) {
    if (stream.delivery === DeliveryType.person) {
      return stream.times;
    }
  }
  return null;
}

export function normaliseTimes(times: ClassTime[]): ClassTime[] {
  const map = new Map<string, ClassTime>();
  for (const t of times) {
    const key = `${t.time}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, t);
    } else {
      if (existing.location !== t.location) {
        existing.location = 'Variable location - Check with school or course admin'
      }
      existing.weeks = mergeWeeks(t.weeks || '', existing.weeks || '');
    }
  }

  const results = Array.from(map.values());
  return results.sort(sortClassTimes);
}

function mergeWeeks(weeks: string, other: string): string {
  const weekSet = new Set<number>(weekStringToArray(weeks));
  const otherWeeks = weekStringToArray(other);
  for (const w of otherWeeks) {
    weekSet.add(w);
  }
  return weekArrayToString(Array.from(weekSet)) as string;
}

function weekStringToArray(weeks: string): number[] {
  const result: number[] = [];
  const parts = weeks.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(x => parseInt(x, 10));
      if (Number.isNaN(start) || Number.isNaN(end)) continue;
      for (let i = start; i <= end; ++i) {
        result.push(i);
      }
    } else {
      const week = parseInt(part, 10);
      if (!Number.isNaN(week)) {
        result.push(week);
      }
    }
  }
  return result;
}

function weekArrayToString(weeks: number[]): string | undefined {
  if (weeks.length === 0) {
    return undefined;
  }
  weeks.sort((a, b) => a - b);

  const parts: string[] = [];
  let rangeStart: number | null = null;
  let lastWeek: number | null = null;
  for (const week of weeks) {
    if (rangeStart === null) {
      rangeStart = week;
      lastWeek = week;
    } else if (lastWeek !== null && week === lastWeek + 1) {
      lastWeek = week;
    } else {
      if (rangeStart === lastWeek) {
        parts.push(`${rangeStart}`);
      } else {
        parts.push(`${rangeStart}-${lastWeek}`);
      }
      rangeStart = week;
      lastWeek = week;
    }
  }
  if (rangeStart !== null) {
    if (rangeStart === lastWeek) {
      parts.push(`${rangeStart}`);
    } else if (lastWeek !== null) {
      parts.push(`${rangeStart}-${lastWeek}`);
    }
  }

  return parts.join(',');
}

function sortClassTimes(a: ClassTime, b: ClassTime): number {
  const dayA = a.time.charAt(0);
  const dayB = b.time.charAt(0);
  if (dayA !== dayB) {
    return ALL_DAYS.indexOf(dayA as DayLetter) - ALL_DAYS.indexOf(dayB as DayLetter);
  }

  const startA = parseFloat(a.time.slice(1).split('-')[0]);
  const startB = parseFloat(b.time.slice(1).split('-')[0]);
  return startA - startB;
}

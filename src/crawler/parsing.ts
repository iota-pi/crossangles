import { CourseData } from "../state/Course";
import { StreamData, ClassTime } from "../state/Stream";

const CourseNames: { [code: string]: string } = require('../../src/assets/courses.json');

export const parseCourse = (_code: string, _name: string): CourseData => {
  const code = _code.trim();
  const term = (/ \(([A-Z][A-Z0-9]{2})\)/.exec(_name) || [])[1];
  const fullName = CourseNames[code];
  const name = fullName || _name.trim().replace(new RegExp(`\\s*\\(${term}\\)$`), '');
  return {
    code,
    name,
    streams: [],
    term,
  };
}

export const removeDuplicateStreams = (course: CourseData) => {
  const mapping = new Map<string, StreamData[]>();
  for (let stream of course.streams) {
    const times = stream.times !== null ? stream.times.map(t => t.time) : null;
    const key = stream.component + `[${times}]`;
    const currentGroup = mapping.get(key) || [];
    const newGroup = currentGroup.concat(stream);
    mapping.set(key, newGroup);
  }

  // For each set of streams with identical component and times, remove all but the emptiest stream
  for (const streamGroup of Array.from(mapping.values())) {
    const emptiest = emptiestStream(streamGroup);
    for (let stream of streamGroup) {
      if (stream !== emptiest) {
        const index = course.streams.indexOf(stream)
        course.streams.splice(index, 1);
      }
    }
  }
}

const emptiestStream = (streams: StreamData[]) => {
  let bestStream = null;
  let bestRatio = Infinity;
  for (let stream of streams) {
    const ratio = stream.enrols[0] / stream.enrols[1];
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestStream = stream;
    }
  }

  return bestStream!;
}

export const parseStream = (
  component: string,
  section: string,
  enrolString: string,
  timeString: string,
  status: string,
): StreamData | null => {
  if (component === 'CRS') {
    return null;
  }

  status = status.trim().replace(/\*$/, '').toLowerCase();
  if (status !== 'open' && status !== 'full') {
    return null;
  }
  const full = status === 'full';

  const enrols = enrolString.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
  if (enrols[1] === 0) {
    return null;
  }

  let web = false;
  let times: ClassTime[] | null = null;
  if (section.indexOf('WEB') === -1) {
    times = parseTimeStr(timeString);

    if (times === null || times.length === 0) {
      return null;
    }
  } else {
    web = true;

    // Standardise all web streams as 'LEC' component
    component = 'LEC';
  }

  return {
    component,
    enrols,
    full,
    times,
    web,
  };
}

export const parseTimeStr = (timeString: string): ClassTime[] | null => {
  // Basic string sanitisation
  timeString = timeString.replace(/\/odd|\/even|Comb\/w.*/g, '').trim();

  // Return empty list if no data has been given
  if (timeString === '') {
    return [];
  }

  if (timeString.indexOf('; ') !== -1) {
    const timeParts = timeString.split('; ');
    const times = timeParts.reduce((a: ClassTime[], t) => a.concat(_parseDataStr(t)), []);

    // Remove any duplicate times
    const timeSet = new Set();
    const finalTimes: ClassTime[] = [];
    for (let time of times) {
      if (!timeSet.has(time.time)) {
        timeSet.add(time.time);
        finalTimes.push(time);
      }
    }

    return finalTimes;
  } else {
    return _parseDataStr(timeString);
  }
}

const _parseDataStr = (data: string): ClassTime[] => {
  const openBracketIndex = data.indexOf('(');
  if (openBracketIndex !== -1) {
    const tidiedTime = tidyUpTime(data.slice(0, openBracketIndex).trim());
    if (tidiedTime === null) {
      return [];
    }
    const [time, canClash] = tidiedTime;

    const otherDetails = data.slice(openBracketIndex + 1, data.indexOf(')'));
    const weeks = getWeeks(otherDetails);
    if (weeks === null) {
      return [];
    }

    const commaIndex = otherDetails.indexOf(', ')
    let location = '';
    if (commaIndex !== -1) {
      location = otherDetails.slice(commaIndex + 2);
    } else if (otherDetails.length > 0 && otherDetails[0] !== 'w') {
      location = otherDetails;
    }

    location = location.toLowerCase() !== 'see school' ? location : '';

    return [{
      time,
      weeks: weeks || undefined,
      location: location || undefined,
      canClash,
    }];
  } else {
    const tidiedTime = tidyUpTime(data);
    if (tidiedTime !== null) {
      const [ time, canClash ] = tidiedTime;
      return [{ time, canClash }];
    } else {
      return [];
    }
  }
}

const tidyUpTime = (time: string): [string, boolean | undefined] | null => {
  if (time === '' || time === '00-00') {
    return null;
  }

  const days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's'};
  for (let [day, letter] of Object.entries(days)) {
    time = time.replace(day + ' ', letter);
  }

  // Use decimal notation for half-hours
  time = time.replace(':30', '.5')

  // Remove leading zeros
  time = time.replace(/(?<=[MTWHFSs])0(?=[0-9])/, '');

  // Don't include courses which run over multiple days (usually intensives) or on weekends
  if (isNaN(+time[1]) || time.toLocaleLowerCase().indexOf('s') !== -1) {
    return null;
  }

  const canClash = time.endsWith('#') ? true : undefined;
  time = time.replace(/#$/, '');

  return [time, canClash];
}

const getWeeks = (weeks: string) => {
  weeks = weeks.split(', ')[0].replace(/^[, ]|[, ]$/g, '');

  if (weeks === '' || weeks[0] !== 'w' || weeks === 'w') {
    if (weeks === 'w') {
      console.warn('turns out weeks can be just a single w');
    }
    return '';
  }

  weeks = weeks.replace(/^w/, '');

  // Don't include classes which only run outside of regular term weeks
  if (/^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks)) {
    return null;
  }

  return weeks;
}

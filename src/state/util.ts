export interface ClassTime {
  time: string,
  location?: string,
  weeks?: string,
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
    const time = tidyUpTime(data.slice(0, openBracketIndex).trim());
    if (time === null) {
      return [];
    }

    const otherDetails = data.slice(openBracketIndex, data.indexOf(')'));
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
      location: location || undefined
    }];
  } else {
    const time = tidyUpTime(data);
    return time !== null ? [{ time }] : [];
  }
}

const tidyUpTime = (time: string) => {
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

  return time;
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

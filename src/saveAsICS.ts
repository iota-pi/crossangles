import download from 'downloadjs';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { ALL_DAYS, DayLetter, getDuration, LinkedSession, Meta } from './state';
import { getComponentName, getOfferingStart, parseBackwardsDateString } from './state/Stream';


export function saveAsICS({
  sessions,
  meta,
}: {
  sessions: LinkedSession[],
  meta: Meta,
}) {
  const eventAttributes = sessions.map((s): EventAttributes => {
    const realStartTime = getRealTime({
      day: s.day,
      hour: s.start,
      termStart: getTermStart(s, meta),
      week: s.weeks ? getFirstWeek(s.weeks) : 1,
    });
    const duration = getDuration(s);
    const isSpecialCourse = s.course.isAdditional || s.course.isCustom || false;
    const title = (
      isSpecialCourse
        ? s.stream.component
        : `${s.course.code} ${getComponentName(s.stream)}`
    );

    const descriptionParts: string[] = [];
    if (s.weeks) {
      descriptionParts.push(`Weeks: ${s.weeks}`);
    }
    if (s.stream.notes) {
      descriptionParts.push(s.stream.notes);
    }
    const description = descriptionParts.join('\\n\\n');
    const recurrenceDates = getRecurrenceDates(s, meta);
    const rdate = getRDATEParam(recurrenceDates);

    return {
      description,
      duration: {
        hours: Math.floor(duration),
        minutes: (duration % 1) * 60,
      },
      productId: 'CrossAngles',
      start: toDateArray(realStartTime),
      startOutputType: 'local',
      recurrenceRule: `FREQ=WEEKLY;COUNT=1\r\n${rdate}`,
      location: s.location,
      title,
    };
  });

  const icsOutput = createEvents(eventAttributes);
  if (icsOutput.value) {
    const data = new Blob([icsOutput.value]);
    const filename = `crossangles-${meta.year}-${meta.term}.ics`;
    const mime = 'text/ics';
    return download(data, filename, mime) === true;
  } else if (icsOutput.error) {
    // TODO: dispatch error instead/as well?
    throw icsOutput.error;
  }
  return false;
}

export function getTermStart(session: LinkedSession, meta: Meta) {
  return (
    session.stream.offering
      ? parseBackwardsDateString(getOfferingStart(session.stream.offering))
      : new Date(meta.termStart)
  );
}

export function getFirstWeek(weeksString: string) {
  return weeksToArray(weeksString)[0];
}

export function weeksToArray(weeksString: string): number[] {
  const resultSet = new Set<number>();
  const ranges = weeksString.split(/,\s*/g);
  for (const range of ranges) {
    const [start, end] = range.split(/-/).map(x => parseInt(x));
    const stop = end || start;
    for (let i = start; i <= stop; i++) {
      resultSet.add(i);
    }
  }
  // Sort result numerically
  const weekList = Array.from(resultSet.values()).sort((a, b) => +(a > b) - +(a < b));
  return weekList;
}

export function getRecurrenceDates(session: LinkedSession, meta: Meta): Date[] {
  const weeksArray = weeksToArray(session.weeks ? session.weeks : '1-10');
  return weeksArray.map(week => getRealTime({
    day: session.day,
    hour: session.start,
    termStart: getTermStart(session, meta),
    week,
  }));
}

export function getRDATEParam(dates: Date[]): string {
  // We can skip the first date since it will be created anyway
  const dateString = dates.slice(1).map(
    d => {
      const year = d.getFullYear().toString();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const seconds = d.getSeconds().toString().padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    },
  ).join(',\r\n ');
  return `RDATE;VALUE=DATE-TIME:${dateString}`;
}

export function getRealTime({
  day,
  hour,
  termStart,
  week,
}: {
  day: DayLetter,
  hour: number,
  termStart: Date,
  week: number,
}): Date {
  const dayIndex = ALL_DAYS.indexOf(day);
  const result = new Date(termStart);
  result.setUTCDate(result.getUTCDate() + 7 * (week - 1) + dayIndex);
  result.setHours(hour);
  return result;
}

export function toDateArray(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

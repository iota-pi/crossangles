import download from 'downloadjs'
import { createEvents, DateArray, EventAttributes } from 'ics'
import { ALL_DAYS, DayLetter, getDuration, LinkedSession, Meta } from './state'
import { getComponentName, getOfferingStart, parseBackwardsDateString } from './state/Stream'


export function saveAsICS({
  sessions,
  meta,
}: {
  sessions: LinkedSession[],
  meta: Meta,
}) {
  const eventAttributes = sessions.map((s): EventAttributes => {
    const weeksArray = weeksToArray(s.weeks ? s.weeks : '1-10')
    const startWeek = weeksArray[0] || 1
    const endWeek = weeksArray[weeksArray.length - 1] || 1
    const count = endWeek - startWeek + 1

    const realStartTime = getRealTime({
      day: s.day,
      hour: s.start,
      termStart: getTermStart(s, meta),
      week: startWeek,
    })
    const duration = getDuration(s)
    const isSpecialCourse = s.course.isAdditional || s.course.isCustom || false
    const title = (
      isSpecialCourse
        ? s.stream.component
        : `${s.course.code} ${getComponentName(s.stream)}`
    )

    const descriptionParts: string[] = []
    if (s.weeks) {
      descriptionParts.push(`Weeks: ${s.weeks}`)
    }
    if (s.stream.notes) {
      descriptionParts.push(s.stream.notes)
    }
    const description = descriptionParts.join('\\n\\n')

    const exclusionDates = getExclusionDates(s, meta, weeksArray, startWeek, endWeek)

    const event: EventAttributes = {
      description,
      duration: {
        hours: Math.floor(duration),
        minutes: (duration % 1) * 60,
      },
      productId: 'CrossAngles',
      start: toDateArray(realStartTime),
      startOutputType: 'local',
      recurrenceRule: `FREQ=WEEKLY;COUNT=${count}`,
      location: s.location,
      title,
    }

    if (exclusionDates.length > 0) {
      event.exclusionDates = exclusionDates
    }

    return event
  })

  const icsOutput = createEvents(eventAttributes)
  if (icsOutput.value) {
    const data = new Blob([icsOutput.value])
    const filename = `crossangles-${meta.year}-${meta.term}.ics`
    const mime = 'text/ics'
    return download(data, filename, mime) === true
  } else if (icsOutput.error) {
    // TODO: dispatch error instead/as well?
    throw icsOutput.error
  }
  return false
}

export function getTermStart(session: LinkedSession, meta: Meta) {
  return (
    session.stream.offering
      ? parseBackwardsDateString(getOfferingStart(session.stream.offering))
      : new Date(meta.termStart)
  )
}

export function weeksToArray(weeksString: string): number[] {
  const resultSet = new Set<number>()
  const ranges = weeksString.split(/,\s*/g)
  for (const range of ranges) {
    const [start, end] = range.split(/-/).map(x => parseInt(x))
    const stop = end || start
    for (let i = start; i <= stop; i++) {
      resultSet.add(i)
    }
  }
  // Sort result numerically
  const weekList = Array.from(resultSet.values()).sort((a, b) => +(a > b) - +(a < b))
  return weekList
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
  const dayIndex = ALL_DAYS.indexOf(day)
  const result = new Date(termStart)
  result.setUTCDate(result.getUTCDate() + 7 * (week - 1) + dayIndex)
  result.setHours(hour)
  return result
}

export function toDateArray(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ]
}

export function getExclusionDates(
  session: LinkedSession,
  meta: Meta,
  weeksArray: number[],
  startWeek: number,
  endWeek: number,
): DateArray[] {
  const exclusionDates: DateArray[] = []
  const weeksSet = new Set(weeksArray)
  for (let week = startWeek; week <= endWeek; week++) {
    if (!weeksSet.has(week)) {
      const exclStartTime = getRealTime({
        day: session.day,
        hour: session.start,
        termStart: getTermStart(session, meta),
        week,
      })
      exclusionDates.push(toDateArray(exclStartTime))
    }
  }
  return exclusionDates
}

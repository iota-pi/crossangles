import { vi, describe, it, expect } from 'vitest'
import download from 'downloadjs'
import { createEvents } from 'ics'
import {
  saveAsICS,
  getTermStart,
  weeksToArray,
  getRealTime,
  toDateArray,
  getExclusionDates,
} from './saveAsICS'
import { getLinkedSession, getMeta } from './test_util'

vi.mock('downloadjs', () => ({
  default: vi.fn(() => true),
}))

vi.mock('ics', () => ({
  createEvents: vi.fn(() => ({ value: 'mocked-ics-string' })),
}))

describe('weeksToArray', () => {
  it('parses a simple range', () => {
    expect(weeksToArray('1-5')).toEqual([1, 2, 3, 4, 5])
  })

  it('parses a comma-separated list of ranges and values', () => {
    expect(weeksToArray('1,3,5-7')).toEqual([1, 3, 5, 6, 7])
  })

  it('parses single weeks', () => {
    expect(weeksToArray('2')).toEqual([2])
  })

  it('handles spaces gracefully', () => {
    expect(weeksToArray(' 1-3 ,  5 ')).toEqual([1, 2, 3, 5])
  })
})

describe('getTermStart', () => {
  it('returns offering start date if stream has offering', () => {
    const session = getLinkedSession(0, 0)
    session.stream.offering = '15/06/2026'
    const meta = getMeta()
    const result = getTermStart(session, meta)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5) // June (0-indexed)
    expect(result.getDate()).toBe(15)
  })

  it('falls back to meta termStart if stream has no offering', () => {
    const session = getLinkedSession(0, 0)
    session.stream.offering = undefined
    const meta = getMeta()
    meta.termStart = '2026-06-01'
    const result = getTermStart(session, meta)
    expect(result).toEqual(new Date('2026-06-01'))
  })
})

describe('getRealTime', () => {
  it('calculates the correct date for Week 1 Monday', () => {
    const termStart = new Date('2026-06-15T00:00:00Z') // Monday of Week 1
    const result = getRealTime({
      day: 'M',
      hour: 9,
      termStart,
      week: 1,
    })
    // 2026-06-15 at 9:00 local time
    expect(result.getHours()).toBe(9)
    expect(result.getDate()).toBe(15)
    expect(result.getMonth()).toBe(5) // June
  })

  it('calculates the correct date for Week 2 Wednesday', () => {
    const termStart = new Date('2026-06-15T00:00:00Z') // Monday of Week 1
    const result = getRealTime({
      day: 'W',
      hour: 14,
      termStart,
      week: 2,
    })
    // Week 2 Wednesday = termStart + 7 days (for week 2) + 2 days (Wednesday index 2) = June 24
    expect(result.getHours()).toBe(14)
    expect(result.getDate()).toBe(24)
    expect(result.getMonth()).toBe(5) // June
  })
})

describe('toDateArray', () => {
  it('formats a date into [year, month, day, hour, minute]', () => {
    const date = new Date(2026, 5, 20, 10, 30)
    expect(toDateArray(date)).toEqual([2026, 6, 20, 10, 30])
  })
})

describe('getExclusionDates', () => {
  it('identifies missing weeks in a non-sequential range', () => {
    const session = getLinkedSession(0, 0, { start: 10, day: 'M' })
    const meta = getMeta()
    meta.termStart = '2026-06-15T00:00:00Z'
    // Weeks scheduled: 1, 3, 5
    const weeksArray = [1, 3, 5]
    const exclusion = getExclusionDates(session, meta, weeksArray, 1, 5)

    // Missing weeks: 2, 4
    expect(exclusion.length).toBe(2)
    // Week 2 Monday (June 22)
    expect(exclusion[0]).toEqual([2026, 6, 22, 10, 0])
    // Week 4 Monday (July 6)
    expect(exclusion[1]).toEqual([2026, 7, 6, 10, 0])
  })

  it('returns empty array if no weeks are missing', () => {
    const session = getLinkedSession(0, 0)
    const meta = getMeta()
    const weeksArray = [1, 2, 3]
    const exclusion = getExclusionDates(session, meta, weeksArray, 1, 3)
    expect(exclusion).toEqual([])
  })
})

describe('saveAsICS', () => {
  it('correctly maps sessions and invokes createEvents and download', () => {
    const session1 = getLinkedSession(0, 0, {
      weeks: '1,3',
      start: 9,
      end: 10,
      day: 'M',
      location: 'Room A',
    })
    const meta = getMeta()
    meta.termStart = '2026-06-15T00:00:00Z'
    meta.year = 2026
    meta.term = 1

    const result = saveAsICS({
      sessions: [session1],
      meta,
    })

    expect(result).toBe(true)
    expect(createEvents).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'RING9731 Lecture',
        location: 'Room A',
        start: [2026, 6, 15, 9, 0],
        recurrenceRule: 'FREQ=WEEKLY;COUNT=3',
        // Missing week 2 Monday (June 22)
        exclusionDates: [[2026, 6, 22, 9, 0]],
      }),
    ])
    expect(download).toHaveBeenCalledWith(
      expect.any(Blob),
      'crossangles-2026-1.ics',
      'text/ics',
    )
  })
})

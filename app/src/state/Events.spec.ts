import { getAutoSelectedEvents, getEvents, getEventId } from './Events'
import { CourseMap, CourseId, CourseData } from './Course'
import { ClassTime } from './Stream'


describe('getEventId', () => {
  it('gives expected result', () => {
    const course: CourseData = {
      code: 'RING1379',
      name: 'Ring Theory 1A',
      streams: [
        { component: 'Secret Forging', times: [{ time: 'M8', location: 'Mount Doom' }] },
      ],
      isAdditional: true,
    }
    const result = getEventId(course, 'Secret Forging')
    expect(result).toBe('RING1379~Secret Forging')
  })
})


describe('getEvents', () => {
  const baseCourse: CourseData = {
    code: 'code',
    name: '',
    streams: [
      { component: 'a', times: [] },
      { component: 'b', times: [] },
    ],
  }

  it('gets events from additional course', () => {
    const course: CourseData = { ...baseCourse, isAdditional: true }
    const result = getEvents(course)
    expect(result).toEqual([
      { id: 'code~a', name: 'a' },
      { id: 'code~b', name: 'b' },
    ])
  })

  it('gives no events for non-additional courses', () => {
    expect(getEvents(baseCourse)).toEqual([])
    expect(getEvents({ ...baseCourse, isAdditional: false })).toEqual([])
  })

  it('doesn\'t give duplicate events', () => {
    const course: CourseData = {
      code: 'code',
      name: '',
      isAdditional: true,
      streams: [
        { component: 'a', times: [] },
        { component: 'a', times: [] },
      ],
    }
    const result = getEvents(course)
    expect(result).toEqual([
      { id: 'code~a', name: 'a' },
    ])
  })
})

describe('getAutoSelectedEvents', () => {
  it('gets events from auto-selected courses', () => {
    const times: ClassTime[] = []
    const courseMap: CourseMap = {
      a: {
        code: 'a',
        name: '',
        isAdditional: true,
        autoSelect: true,
        streams: [
          { component: 'a', times },
          { component: 'b', times },
        ],
      },
      b: {
        code: 'b',
        name: '',
        autoSelect: true,
        streams: [
          { component: 'c', times },
        ],
      },
      d: {
        code: 'd',
        name: '',
        isAdditional: true,
        streams: [
          { component: 'd', times },
        ],
      },
    }
    const additional: CourseId[] = ['a', 'd']
    const result = getAutoSelectedEvents(courseMap, additional)
    expect(result).toEqual([
      { id: 'a~a', name: 'a' },
      { id: 'a~b', name: 'b' },
    ])
  })
})

import { DropzoneManager } from './dropzones'
import { LinkedStream } from '../../state'
import { getLinkedStream, getLinkedSession } from '../../test_util'
import { DropzonePlacement } from './DropzonePlacement'

describe('filterStreams', () => {
  it('filterStreams([], ...) = []', () => {
    const dm = new DropzoneManager()
    const result = dm.filterStreams({
      streams: [],
      component: 'LEC',
      index: 0,
      includeFull: false,
    })
    expect(result).toEqual([])
  })

  it('ignores other components', () => {
    const keepStreams: LinkedStream[] = [getLinkedStream(0)]
    const skipStreams: LinkedStream[] = [getLinkedStream(2)]
    const streams = [...keepStreams, ...skipStreams]
    const dm = new DropzoneManager()
    const result = dm.filterStreams({
      streams,
      component: keepStreams[0].component,
      index: 0,
      includeFull: false,
    })
    expect(result).toEqual(keepStreams)
  })

  it('ignores streams without enough sessions', () => {
    const component = 'TLA'
    const keepStreams: LinkedStream[] = [getLinkedStream(0, { component })]
    const skipStreams: LinkedStream[] = [getLinkedStream(2, { component })]
    const streams = [...keepStreams, ...skipStreams]
    const dm = new DropzoneManager()
    expect(dm.filterStreams({ streams, component, index: 1, includeFull: false })).toEqual(keepStreams)
    expect(dm.filterStreams({ streams, component, index: 2, includeFull: false })).toEqual(keepStreams)
    expect(dm.filterStreams({ streams, component, index: 3, includeFull: false })).toEqual([])
  })

  it('skips full classes if includeFull = False', () => {
    const component = 'TLA'
    const keepStreams: LinkedStream[] = [getLinkedStream(0, { component, full: false })]
    const skipStreams: LinkedStream[] = [getLinkedStream(2, { component, full: true })]
    const streams = [...keepStreams, ...skipStreams]
    const dm = new DropzoneManager()
    expect(dm.filterStreams({ streams, component, index: 0, includeFull: false })).toEqual(keepStreams)
  })

  it('includes full classes if includeFull = True', () => {
    const component = 'TLA'
    const streams: LinkedStream[] = [
      getLinkedStream(0, { component, full: false }),
      getLinkedStream(2, { component, full: true }),
    ]
    const dm = new DropzoneManager()
    expect(dm.filterStreams({ streams, component, index: 0, includeFull: true })).toEqual(streams)
  })
})

describe('streamsToDropzones', () => {
  it('returns array of dropzones', () => {
    const dm = new DropzoneManager()
    const streams: LinkedStream[] = [
      getLinkedStream(0),
      getLinkedStream(1),
    ]
    const index = 1
    const result = dm.streamsToDropzones(streams, index)
    expect(result).toHaveLength(streams.length)
    for (let i = 0; i < streams.length; ++i) {
      expect(result[i]).toBeInstanceOf(DropzonePlacement)
      expect(result[i].session).toBe(streams[i].sessions[index])
    }
  })
})

describe('filterDropzones', () => {
  it('removes dropzones with duplicate start times', () => {
    const dm = new DropzoneManager()
    const dropzones: DropzonePlacement[] = [
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 12, end: 13 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'T', start: 11, end: 12 })),
    ]
    const result = dm.filterDropzones(dropzones, getLinkedSession(1))
    expect(result).toHaveLength(3)
    expect(result).toContain(dropzones[0])
    expect(result).not.toContain(dropzones[1])
    expect(result).toContain(dropzones[2])
    expect(result).toContain(dropzones[3])
  })
})

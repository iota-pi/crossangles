import { webStreams } from './webStreams'
import { ClearNoticeAction, CLEAR_NOTICE, CourseAction, TOGGLE_WEB_STREAM } from '../actions'
import { initialState, CourseId } from '../state'

const otherAction: ClearNoticeAction = { type: CLEAR_NOTICE }

describe('webStreams reducer', () => {
  it('initialises correctly', () => {
    const state = webStreams(undefined, otherAction)
    expect(state).toEqual(initialState.webStreams)
  })

  it('doesn\'t change on no-op actions', () => {
    const initial: CourseId[] = []
    const state = [...initial]
    const result = webStreams(state, otherAction)
    expect(result).toBe(state)
    expect(state).toEqual(initial)
  })

  it('can toggle on', () => {
    const state = [...initialState.webStreams]
    const action: CourseAction = {
      type: TOGGLE_WEB_STREAM,
      course: { code: 'a', name: '', streams: [] },
    }
    const prevState = state
    const result = webStreams(state, action)
    expect(state).toBe(prevState)
    expect(state).toEqual(initialState.webStreams)
    expect(result).toEqual(['a'])
  })

  it('can toggle off', () => {
    const state = ['a']
    const action: CourseAction = {
      type: TOGGLE_WEB_STREAM,
      course: { code: 'a', name: '', streams: [] },
    }
    const prevState = state
    const result = webStreams(state, action)
    expect(state).toBe(prevState)
    expect(state).toEqual(['a'])
    expect(result).toEqual([])
  })
})

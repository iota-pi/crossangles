import { notice } from './notice'
import {
  ClearNoticeAction, CLEAR_NOTICE, SetNoticeAction, SET_NOTICE, CourseAction, TOGGLE_WEB_STREAM,
} from '../actions'
import { initialState, Notice } from '../state'

const otherAction: CourseAction = { type: TOGGLE_WEB_STREAM, course: { code: '', name: '', streams: [] } }

describe('notice reducer', () => {
  it('initialises correctly', () => {
    const state = notice(undefined, otherAction)
    expect(state).toEqual(initialState.notice)
  })

  it('doesn\'t change on no-op actions when null', () => {
    const result = notice(initialState.notice, otherAction)
    expect(result).toBe(initialState.notice)
  })

  it('doesn\'t change on no-op actions', () => {
    const initial: Notice = { message: 'hello', actions: null, timeout: null }
    const state = { ...initial }
    const result = notice(state, otherAction)
    expect(result).toBe(state)
    expect(state).toEqual(initial)
  })

  it('can be set when null', () => {
    const testNotice: Notice = { message: 'hello', actions: null, timeout: null }
    const action: SetNoticeAction = {
      type: SET_NOTICE,
      ...testNotice,
    }
    const state = notice(null, action)
    expect(state).toEqual(testNotice)
  })

  it('can be overwritten when not null', () => {
    const testNotice: Notice = { message: 'hello', actions: null, timeout: null }
    const testNotice2: Notice = { message: 'there', actions: [], timeout: null }
    const action: SetNoticeAction = {
      type: SET_NOTICE,
      ...testNotice2,
    }
    const state = notice(testNotice, action)
    expect(testNotice).toEqual({ message: 'hello', actions: null, timeout: null })
    expect(state).toEqual(testNotice2)
  })

  it('can clear notice', () => {
    const testNotice: Notice = { message: 'hello', actions: null, timeout: null }
    const action: ClearNoticeAction = { type: CLEAR_NOTICE }
    const state = notice(testNotice, action)
    expect(state).toBeNull()
  })

  it('can clear notice when already null', () => {
    const action: ClearNoticeAction = { type: CLEAR_NOTICE }
    const state = notice(null, action)
    expect(state).toBeNull()
  })
})

import type { ThunkDispatch } from 'redux-thunk'
import type { RootState } from './state'
import type { AnyAction } from 'redux'

export function notNull<T = any>(val: T | null): T {
  if (val === null) {
    throw new Error('notNull given a null value')
  }
  return val
}

export function notUndefined<T = any>(val: T | undefined): T {
  if (val === undefined) {
    throw new TypeError('notUndefined given an undefined value')
  }
  return val
}

export function isSet<T = any>(val: T | null | undefined) {
  return notNull(notUndefined(val))
}

export type WithDispatch<T> = T & { dispatch: ThunkDispatch<RootState, undefined, AnyAction> }

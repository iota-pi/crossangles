import { useRef } from 'react'

export function useCache<T>(value: T | undefined): T | undefined {
  const cache = useRef(value)
  if (value !== undefined) {
    // eslint-disable-next-line react-hooks/refs
    cache.current = value
  }
  // eslint-disable-next-line react-hooks/refs
  return cache.current
}

export default { useCache }

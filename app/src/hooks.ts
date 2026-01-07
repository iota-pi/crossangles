import { useEffect, useState } from 'react'

export function useCache<T>(value: T | undefined): T | undefined {
  const [cache, setCache] = useState(value)
  useEffect(() => {
    if (value !== undefined) {
      setCache(value)
    }
  }, [value])
  return cache
}

export default { useCache }

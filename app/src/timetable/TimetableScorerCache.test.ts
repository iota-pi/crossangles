import { TimetableScorerCache } from './TimetableScorerCache'

describe('coursesToComponents', () => {
  it('can store a single value', () => {
    const cache = new TimetableScorerCache()
    const key = [0]
    cache.set(key, 0)
    expect(cache.has(key)).toBe(true)
  })

  it('can round-trip a single value', () => {
    const cache = new TimetableScorerCache()
    const key = [0]
    cache.set(key, 1)
    expect(cache.get(key)).toBe(1)
  })

  it('can round-trip multiple values', () => {
    const cache = new TimetableScorerCache()
    cache.set([0], 1)
    cache.set([1], 2)
    expect(cache.get([0])).toBe(1)
    expect(cache.get([1])).toBe(2)
  })

  it('can round-trip values on the second level', () => {
    const cache = new TimetableScorerCache()
    cache.set([0, 0], 1)
    cache.set([0, 1], 2)
    expect(cache.get([0, 0])).toBe(1)
    expect(cache.get([0, 1])).toBe(2)
  })

  it('can round-trip two levels', () => {
    const cache = new TimetableScorerCache()
    cache.set([0, 0], 1)
    cache.set([1, 0], 2)
    expect(cache.get([0, 0])).toBe(1)
    expect(cache.get([1, 0])).toBe(2)
  })

  it('can round-trip many values, many levels', () => {
    const cache = new TimetableScorerCache()
    const key1 = [4, 1, 0, 3]
    const key2 = [0, 2, 1, 0]
    cache.set(key1, 4)
    cache.set(key2, 10)
    expect(cache.get(key1)).toBe(4)
    expect(cache.get(key2)).toBe(10)
  })

  it('can overwrite an existing values', () => {
    const cache = new TimetableScorerCache()
    const key = [0, 3]
    cache.set(key, 3)
    cache.set(key, 5)
    expect(cache.get(key)).toBe(5)
  })

  it('can write at multiple different levels', () => {
    const cache = new TimetableScorerCache()
    const key1 = [0, 3]
    const key2 = [0, 2, 2]
    cache.set(key1, 5)
    cache.set(key2, 10)
    expect(cache.get(key1)).toBe(5)
    expect(cache.get(key2)).toBe(10)
  })

  it('can overwrite at a different level', () => {
    const cache = new TimetableScorerCache()
    const key1 = [0, 0]
    const key2 = [0, 0, 0]
    cache.set(key1, 5)
    cache.set(key2, 10)
    expect(cache.get(key1)).toBe(undefined)
    expect(cache.get(key2)).toBe(10)
  })

  it('can delete values', () => {
    const cache = new TimetableScorerCache()
    const key = [0, 1, 2, 3, 4, 5]
    cache.set(key, 5)
    cache.delete(key)
    expect(cache.has(key)).toBe(false)
    expect(cache.get(key)).toBe(undefined)
  })
})

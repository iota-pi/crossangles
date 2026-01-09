import getAEST from './getAEST'

it('returns expected time', () => {
  // Test must be run in AEST timezone
  const expected = new Date().getTime()
  const result = getAEST().toDate().getTime()
  expect(result - expected).toBeLessThanOrEqual(100)
})

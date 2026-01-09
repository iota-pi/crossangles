import { getCurrentTerm } from './Meta'

it.each`
  term | year    | expected
  ${1} | ${1980} | ${'1980~1'}
  ${2} | ${2000} | ${'2000~2'}
  ${3} | ${2222} | ${'2222~3'}
`('getCurrentTerm({term:$term, year:$year}) = $expected', ({ term, year, expected }) => {
  expect(getCurrentTerm({ term, year })).toBe(expected)
})

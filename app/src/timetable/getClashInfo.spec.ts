import { sessionClashLength } from './getClashInfo'
import { SessionData } from '../state'

const baseSession: SessionData = {
  course: 'RING1379',
  stream: '',
  index: 0,
  day: 'M',
  start: 10,
  end: 11,
}

it.each`
  sessionA                                  | sessionB                                  | expected
  ${{ start: 9, end: 10 }}                  | ${{ start: 10, end: 11 }}                 | ${0}
  ${{ start: 10, end: 11 }}                 | ${{ start: 10, end: 11 }}                 | ${1}
  ${{ start: 10, end: 11 }}                 | ${{ start: 11, end: 12 }}                 | ${0}
  ${{ start: 11, end: 13 }}                 | ${{ start: 10, end: 14 }}                 | ${2}
  ${{ day: 'T', start: 10, end: 11 }}       | ${{ start: 10, end: 11 }}                 | ${0}
  ${{ day: 'T', start: 10, end: 11 }}       | ${{ day: 'T', start: 10, end: 11 }}       | ${1}
  ${{ day: 'T', start: 10, end: 11 }}       | ${{ day: 'W', start: 10, end: 11 }}       | ${0}
  ${{ start: 11, end: 13, canClash: true }} | ${{ start: 10, end: 14 }}                 | ${1}
  ${{ start: 11, end: 13 }}                 | ${{ start: 10, end: 14, canClash: true }} | ${1}
  ${{ start: 11, end: 13, canClash: true }} | ${{ start: 10, end: 14, canClash: true }} | ${1}
  ${{ start: 11, end: 12, canClash: true }} | ${{ start: 11, end: 12 }}                 | ${0.5}
`('sessionClashLength($day$start-$end) = $expected', ({ sessionA, sessionB, expected }) => {
  const a = { ...baseSession, ...sessionA } as SessionData
  const b = { ...baseSession, ...sessionB } as SessionData
  const result = sessionClashLength(a, b)
  expect(result).toBe(expected)
})

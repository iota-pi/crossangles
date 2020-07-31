import { getSessionId, getDuration } from './Session';
import { getCourse, getLinkedSession } from '../test_util';
import { getSessions, getStreamId } from './Stream';


describe('getSessionId', () => {
  it.each`
    i ${0} ${1} ${2}
  `('gives expected result for session #$i', ({ i }) => {
    const course = getCourse();
    const stream = course.streams[0];
    const session = getSessions(course, stream)[i];
    expect(getSessionId(course, stream, session)).toBe(`${getStreamId(course, stream)}~${i}`);
  });
});

it.each`
  end   | start | expected
  ${11} | ${10} | ${1}
  ${21} | ${15} | ${6}
  ${12} | ${9}  | ${3}
`('getDuration({start: $start, end: $end}) = $expected', ({ end, start, expected }) => {
  const session = getLinkedSession(0, 0, { start, end });
  expect(getDuration(session)).toBe(expected);
});

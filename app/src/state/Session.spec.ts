import { getSessionId } from './Session';
import { getCourse } from '../test_util';
import { getSessions, getStreamId } from './Stream';


describe('getSessionId', () => {
  it.each`
    i ${0} ${1} ${2}
  `('gives expected result for session #$i', ({ i }) => {
    const course = getCourse();
    const stream = course.streams[0];
    const session = getSessions(course, stream)[i];
    expect(getSessionId(course, stream, session)).toBe(getStreamId(course, stream) + `~${i}`);
  })
})

import { getShowSignupCombiner } from './selectors'
import { getCourse, getAdditionalCourse } from '../test_util'
import { getCourseId } from './Course'
import { AdditionalEvent, getEvents } from './Events'

describe('getShowSignup', () => {
  it.each([
    true, false,
  ])('shows and hides signup link correctly (show = %s)', show => {
    const courses = [getCourse(), getAdditionalCourse()]
    const additionalId = getCourseId(courses[1])
    const courseMap = {
      [getCourseId(courses[0])]: courses[0],
      [additionalId]: courses[1],
    }
    const events: AdditionalEvent[] = show ? [getEvents(courses[1])[0]] : []
    expect(getShowSignupCombiner(courseMap, [additionalId], events)).toBe(show)
  })

  it('hides signup link if no chosen events exist', () => {
    const courses = [getCourse(), getAdditionalCourse()]
    const additionalId = getCourseId(courses[1])
    const courseMap = {
      [getCourseId(courses[0])]: courses[0],
      [additionalId]: courses[1],
    }
    const events: AdditionalEvent[] = [{ id: 'adlkjgsd', name: 'Does not exist' }]
    expect(getShowSignupCombiner(courseMap, [additionalId], events)).toBe(false)
  })
})

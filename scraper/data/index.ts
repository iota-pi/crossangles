import { CourseData, getCourseId } from '../../app/src/state/Course'
import unsw from './unsw'


const additional = {
  unsw,
}

/**
 * Returns the additional data for the given campus and term. If there is
 * specific data for the given term, it is merged with the campus default data.
 * @param campus the name of the campus
 * @param term the year and term in the form of e.g. "2020~3"
 */
function getAdditional(campus: keyof typeof additional, term?: string): CourseData[] {
  const baseData = additional[campus].default
  const override = term !== undefined ? additional[campus][term] : undefined
  if (override === undefined) return baseData
  return override.map(course => {
    const baseCourse = baseData.find(c => getCourseId(c) === getCourseId(course))
    return { ...baseCourse, ...course }
  })
}

export default getAdditional

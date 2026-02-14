import { SET_COURSE_DATA, ADD_COURSE, REMOVE_COURSE, AllActions } from '../actions'
import { CourseMap, CourseId, getCourseId, initialState } from '../state'

export function courses(
  state: CourseMap = initialState.courses,
  action: AllActions,
): CourseMap {
  if (action.type === SET_COURSE_DATA) {
    const continuingCourses: CourseMap = {}
    for (const code of Object.keys(state)) {
      const course = state[code]
      if (course.isCustom) {
        continuingCourses[code] = course
      }
    }

    const allCourses: CourseMap = continuingCourses

    // Return with new course data
    for (const course of action.courses) {
      const id = getCourseId(course)
      allCourses[id] = course
    }

    return allCourses
  }

  if (action.type === ADD_COURSE && action.course.isCustom) {
    return {
      ...state,
      [getCourseId(action.course)]: action.course,
    }
  }

  if (action.type === REMOVE_COURSE && action.course.isCustom) {
    const newState = { ...state }
    delete newState[getCourseId(action.course)]
    return newState
  }

  return state
}

export function chosen(
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  console.log(action)
  if (action.type === ADD_COURSE && !action.course.isCustom) {
    return [
      ...state,
      getCourseId(action.course),
    ]
  }

  if (action.type === REMOVE_COURSE && !action.course.isCustom) {
    const i = state.indexOf(getCourseId(action.course))
    return [
      ...state.slice(0, i),
      ...state.slice(i + 1),
    ]
  }

  if (action.type === SET_COURSE_DATA) {
    // Clear chosen courses when moving to new term
    if (action.isNewTerm) {
      return []
    }

    // Only keep chosen courses which have current data
    // This would be necessary if a course stops being offered (or part of its
    // id changes) for a particular term
    const newIds = new Set(action.courses.map(c => getCourseId(c)))
    const newState = state.filter(id => newIds.has(id))
    if (newState.length === state.length) {
      return state
    }
    return newState
  }

  return state
}

export function custom(
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  if (action.type === ADD_COURSE && action.course.isCustom) {
    const courseId = getCourseId(action.course)

    // Don't need to change state for an update event
    if (state.includes(courseId)) {
      return state
    }

    return [...state, courseId]
  }

  if (action.type === REMOVE_COURSE && action.course.isCustom) {
    const i = state.indexOf(getCourseId(action.course))
    return [...state.slice(0, i), ...state.slice(i + 1)]
  }

  return state
}

export function additional(
  state: CourseId[] = [],
  action: AllActions,
): CourseId[] {
  if (action.type === SET_COURSE_DATA) {
    return action.courses.filter(c => c.isAdditional && c.autoSelect).map(c => getCourseId(c))
  } else if (action.type === REMOVE_COURSE) {
    if (action.course.isAdditional) {
      return state.filter(c => c !== getCourseId(action.course))
    }
  }

  return state
}

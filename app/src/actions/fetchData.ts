import type { Action, AnyAction } from 'redux'
import type { ThunkAction } from 'redux-thunk'
import { requestData } from '../requestData'
import type { CourseData, Meta, RootState } from '../state'

export const SET_COURSE_DATA = 'SET_COURSE_DATA'

export interface CourseListAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
  meta: Meta;
  isNewTerm: boolean,
}

type FetchDataAction = ThunkAction<Promise<CourseListAction | void>, RootState, undefined, AnyAction>
export function fetchData(prevMeta: Meta): FetchDataAction {
  return async dispatch => requestData().then(data => {
    const { term, year } = data.meta
    const setCourseAction: CourseListAction = {
      type: SET_COURSE_DATA,
      courses: data.courses,
      meta: data.meta,
      isNewTerm: prevMeta.year !== year || prevMeta.term !== term,
    }

    return dispatch(setCourseAction)
  })
}

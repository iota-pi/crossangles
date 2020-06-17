import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { requestData } from '../requestData';
import { CourseData, Meta } from '../state';

export const SET_COURSE_DATA = 'SET_COURSE_DATA';

export interface CourseListAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
  meta?: Meta;
}

export function fetchData (): ThunkAction<Promise<CourseListAction | void>, {}, undefined, AnyAction> {
  return async dispatch => {
    return requestData().then(data => {
      const setCourseAction: CourseListAction = {
        type: SET_COURSE_DATA,
        courses: data.courses,
        meta: data.meta,
      };

      return dispatch(setCourseAction);
    });
  };
}

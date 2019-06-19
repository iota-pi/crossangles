import axios from 'axios';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { CourseData } from '../state/Course';
import { Meta } from '../state';

export const SET_COURSE_DATA = 'SET_COURSE_DATA';
export const SET_META_DATA = 'SET_META_DATA';

export interface CoursesAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
}
export interface MetaAction extends Action {
  type: typeof SET_META_DATA;
  meta: Meta;
}

export function fetchData (uri: string): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    return axios.get(uri).then(({ data }) => {
      dispatch({
        type: SET_COURSE_DATA,
        courses: data.courses,
      });

      dispatch({
        type: SET_META_DATA,
        meta: data.meta,
      });
    });
  };
}

import axios from 'axios';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { Meta } from '../state/Meta';
import { CourseData } from '../state/Course';

export const SET_COURSE_DATA = 'SET_COURSE_DATA';
export const SET_COURSE_MANAGER = 'SET_COURSE_MANAGER';
export const SET_META_DATA = 'SET_META_DATA';

export interface CourseListAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
}
export interface MetaAction extends Action {
  type: typeof SET_META_DATA;
  meta: Meta;
}

export function fetchData (uri: string): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    return axios.get(uri).then(async ({ data }) => {
      const setCourseAction: CourseListAction = {
        type: SET_COURSE_DATA,
        courses: data.courses,
      };
      const p1 = dispatch(setCourseAction);

      const p2 = dispatch({
        type: SET_META_DATA,
        meta: data.meta,
      });

      await p1;
      await p2;
    });
  };
}

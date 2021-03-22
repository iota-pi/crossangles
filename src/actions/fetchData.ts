import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { store } from '../configureStore';
import { requestData } from '../requestData';
import { CourseData, Meta } from '../state';

export const SET_COURSE_DATA = 'SET_COURSE_DATA';

export interface CourseListAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
  meta: Meta;
  isNewTerm: boolean,
}

type FetchDataAction = ThunkAction<Promise<CourseListAction | void>, {}, undefined, AnyAction>;
export function fetchData(): FetchDataAction {
  const state = store.getState();
  const { meta } = state;

  return async dispatch => requestData().then(data => {
    const { term, year } = data.meta;
    const setCourseAction: CourseListAction = {
      type: SET_COURSE_DATA,
      courses: data.courses,
      meta: data.meta,
      isNewTerm: meta.year !== year || meta.term !== term,
    };

    return dispatch(setCourseAction);
  });
}

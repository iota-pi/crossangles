import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { requestData } from '../requestData';
import { CourseData, Meta } from '../state';

export const SET_COURSE_DATA = 'SET_COURSE_DATA';

export interface CourseListAction extends Action {
  type: typeof SET_COURSE_DATA;
  courses: CourseData[];
  meta: Meta;
}

type FetchDataAction = ThunkAction<Promise<CourseListAction | void>, {}, undefined, AnyAction>;
export function fetchData(): FetchDataAction {
  return async dispatch => requestData().then(data => {
    // TODO: this shouldn't be needed after the production scraper has updated
    // and the old data's cache time has expired
    const courses = data.courses.map(c => ({
      ...c,
      streams: c.streams.map(s => ({
        ...s,
        times: s.times || [],
      })),
    }));
    const setCourseAction: CourseListAction = {
      type: SET_COURSE_DATA,
      courses,
      meta: data.meta,
    };

    return dispatch(setCourseAction);
  });
}

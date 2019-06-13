import { SET_COURSE_DATA, SET_META_DATA, CoursesAction } from '../actions/fetch';
import { AnyAction } from 'redux';
import { Meta, baseCourses, baseMeta } from '../state';
import { Course } from "../state/Course";
import { TOGGLE_WEB_STREAM, CourseAction } from '../actions/selection';
import Stream from '../state/Stream';

export function courses (state = baseCourses, action: CourseAction | CoursesAction): Course[] {
  switch (action.type) {
    case SET_COURSE_DATA:
      return action.courses.map(courseData => new Course({
        ...courseData,
        streams: courseData.streams.map(streamData => new Stream(streamData)),
      }));
    case TOGGLE_WEB_STREAM:
      const index = state.indexOf(action.course);
      return [
        ...state.slice(0, index),
        state[index].updateWith({
          useWebStream: !state[index].useWebStream,
        }),
        ...state.slice(index + 1),
      ]
  }

  return state;
};

export function meta (state = baseMeta, action: AnyAction): Meta {
  if (action.type === SET_META_DATA) {
    return action.meta
  }

  return state;
};

import { createSelector } from 'reselect';
import { RootState } from '.';
import { courseSort, customSort, CourseId, CourseMap } from './Course';
import { getEmptySessionManagerData } from '../components/Timetable/SessionManagerTypes';
import { getCurrentTerm } from './Meta';
import { getAutoSelectedEvents, AdditionalEvent } from './Events';


const getCourses = (state: RootState) => state.courses;
const getChosen = (state: RootState) => state.chosen;
const getCustom = (state: RootState) => state.custom;
const getAdditional = (state: RootState) => state.additional;
const getEvents = (state: RootState) => state.events;


export const getCurrentTimetable = ({ timetables, meta }: Pick<RootState, 'timetables' | 'meta'>) => {
  const term = getCurrentTerm(meta);
  const timetable = timetables[term];
  if (timetable) {
    return timetable;
  } else {
    return getEmptySessionManagerData();
  }
};

export const getCourseList = createSelector(
  [getCourses],
  (courses) => {
    return Object.values(courses).sort(courseSort);
  }
);

export const getChosenCourses = createSelector(
  [getCourses, getChosen],
  (courses, chosen) => {
    return chosen.map(c => courses[c]).sort(courseSort);
  }
);

export const getCustomCourses = createSelector(
  [getCourses, getCustom],
  (courses, custom) => {
    return custom.map(c => courses[c]).sort(customSort);
  }
);

export const getAdditionalCourses = createSelector(
  [getCourses, getAdditional],
  (courses, additional) => {
    return additional.map(c => courses[c]).sort(courseSort);
  }
);

export const _getShowSignup = (courses: CourseMap, additional: CourseId[], events: AdditionalEvent[]) => {
  let allEvents = getAutoSelectedEvents(courses, additional);
  const eventNames = events.map(e => e.id);
  return allEvents.some(e => eventNames.includes(e.id))
};

export const getShowSignup = createSelector(
  [getCourses, getAdditional, getEvents],
  _getShowSignup,
);

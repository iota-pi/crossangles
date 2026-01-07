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
export const getOptions = (state: RootState) => state.options;


export const getCurrentTimetable = (
  { timetables, meta }: Pick<RootState, 'timetables' | 'meta'>,
) => {
  const term = getCurrentTerm(meta);
  const timetable = timetables[term];
  if (timetable) {
    return timetable;
  }
  return getEmptySessionManagerData();
};

export const getCourseList = createSelector(
  [getCourses],
  courses => Object.values(courses).sort(courseSort),
);

export const getChosenCourses = createSelector(
  [getCourses, getChosen],
  (courses, chosen) => chosen.map(c => courses[c]).sort(courseSort),
);

export const getCustomCourses = createSelector(
  [getCourses, getCustom],
  (courses, custom) => custom.map(c => courses[c]).sort(customSort),
);

export const getAdditionalCourses = createSelector(
  [getCourses, getAdditional],
  (courses, additional) => additional.map(c => courses[c]).sort(courseSort),
);

export function getShowSignupCombiner(
  courses: CourseMap, additional: CourseId[], events: AdditionalEvent[],
) {
  const allEvents = getAutoSelectedEvents(courses, additional);
  const eventNames = events.map(e => e.id);
  return allEvents.some(e => eventNames.includes(e.id));
}

export const getShowSignup = createSelector(
  [getCourses, getAdditional, getEvents],
  getShowSignupCombiner,
);

import { createSelector } from 'reselect';
import { RootState } from '.';
import { courseSort, customSort } from './Course';


const getCourses = (state: RootState) => state.courses;
const getChosen = (state: RootState) => state.chosen;
const getCustom = (state: RootState) => state.custom;
const getAdditional = (state: RootState) => state.additional;


export const getCourseList = createSelector(
  [getCourses],
  (courses) => {
    return Object.values(courses).sort(courseSort);
  }
)

export const getChosenCourses = createSelector(
  [getCourses, getChosen],
  (courses, chosen) => {
    return chosen.map(c => courses[c]).sort(courseSort);
  }
)

export const getCustomCourses = createSelector(
  [getCourses, getCustom],
  (courses, custom) => {
    return custom.map(c => courses[c]).sort(customSort);
  }
)

export const getAdditionalCourses = createSelector(
  [getCourses, getAdditional],
  (courses, additional) => {
    return additional.map(c => courses[c]).sort(courseSort);
  }
);

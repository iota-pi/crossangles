import { CBSEvent, Options, CustomCourse } from "../state";
import { Course } from "../state/Course";
import { Action } from "redux";

// Chosen courses
export const ADD_COURSE = 'ADD_COURSE';
export const REMOVE_COURSE = 'REMOVE_COURSE';
export const TOGGLE_WEB_STREAM = 'TOGGLE_WEB_STREAM';
export interface CourseAction extends Action {
  type: typeof ADD_COURSE | typeof REMOVE_COURSE | typeof TOGGLE_WEB_STREAM;
  course: Course;
}

export function addCourse (course: Course): CourseAction {
  return {
    type: ADD_COURSE,
    course,
  }
}

export function removeCourse (course: Course): CourseAction {
  return {
    type: REMOVE_COURSE,
    course,
  }
}

// Web streams
export function toggleWebStream (course: Course): CourseAction {
  return {
    type: TOGGLE_WEB_STREAM,
    course,
  }
}

// Custom courses
export const ADD_CUSTOM = 'ADD_CUSTOM';
export const REMOVE_CUSTOM = 'REMOVE_CUSTOM';
export interface CustomAction extends Action {
  type: typeof ADD_CUSTOM | typeof REMOVE_CUSTOM;
  custom: CustomCourse;
}

export function addCustom (custom: CustomCourse): CustomAction {
  return {
    type: ADD_CUSTOM,
    custom,
  }
}

export function removeCustom (custom: CustomCourse): CustomAction {
  return {
    type: REMOVE_CUSTOM,
    custom,
  }
}

// Events
export const ADD_EVENT = 'ADD_EVENT';
export const REMOVE_EVENT = 'REMOVE_EVENT';
export interface EventAction extends Action {
  type: typeof ADD_EVENT | typeof REMOVE_EVENT;
  event: CBSEvent;
}

export function addEvent (event: CBSEvent): EventAction {
  return {
    type: ADD_EVENT,
    event,
  }
}

export function removeEvent (event: CBSEvent): EventAction {
  return {
    type: REMOVE_EVENT,
    event,
  }
}

// Options
export const TOGGLE_OPTION = 'TOGGLE_OPTION';

export interface ToggleOptionAction extends Action {
  type: typeof TOGGLE_OPTION;
  option: keyof Options;
}

export function addOption (option: keyof Options): ToggleOptionAction {
  return {
    type: TOGGLE_OPTION,
    option: option,
  }
}

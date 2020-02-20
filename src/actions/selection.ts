import { AdditionalEvent } from '../state';
import { CourseData, CourseId } from '../state/Course';
import { OptionName } from '../state/Options';
import { Action } from 'redux';

// Chosen courses
export const ADD_COURSE = 'ADD_COURSE';
export const REMOVE_COURSE = 'REMOVE_COURSE';
export const TOGGLE_WEB_STREAM = 'TOGGLE_WEB_STREAM';
export interface CourseAction extends Action {
  type: typeof ADD_COURSE | typeof REMOVE_COURSE | typeof TOGGLE_WEB_STREAM;
  course: CourseData;
}

export function addCourse (course: CourseData): CourseAction {
  return {
    type: ADD_COURSE,
    course,
  }
}

export function removeCourse (course: CourseData): CourseAction {
  return {
    type: REMOVE_COURSE,
    course,
  }
}

// Web streams
export function toggleWebStream (course: CourseData): CourseAction {
  return {
    type: TOGGLE_WEB_STREAM,
    course,
  }
}

// Custom courses
export const ADD_CUSTOM = 'ADD_CUSTOM';
export const UPDATE_CUSTOM = 'UPDATE_CUSTOM';
export const REMOVE_CUSTOM = 'REMOVE_CUSTOM';
export interface SimpleCustomAction extends Action {
  type: typeof ADD_CUSTOM | typeof REMOVE_CUSTOM;
  custom: CourseData;
}
export interface UpdateCustomAction extends Action {
  type: typeof UPDATE_CUSTOM;
  custom: CourseData;
}
export type CustomAction = SimpleCustomAction | UpdateCustomAction;

export function addCustom (custom: CourseData): CustomAction {
  return {
    type: ADD_CUSTOM,
    custom,
  }
}

export function removeCustom (custom: CourseData): CustomAction {
  return {
    type: REMOVE_CUSTOM,
    custom,
  }
}

export function updateCustom (custom: CourseData): CustomAction {
  return {
    type: UPDATE_CUSTOM,
    custom,
  }
}

// Events
export const TOGGLE_EVENT = 'TOGGLE_EVENT';
export interface EventAction extends Action {
  type: typeof TOGGLE_EVENT;
  event: AdditionalEvent;
}

export function toggleEvent (event: AdditionalEvent): EventAction {
  return {
    type: TOGGLE_EVENT,
    event,
  }
}

export const TOGGLE_SHOW_EVENTS = 'TOGGLE_SHOW_EVENTS';
export interface ToggleShowEventsAction extends Action {
  type: typeof TOGGLE_SHOW_EVENTS;
  course: CourseId;
}

export function toggleShowEvents (courseId: CourseId): ToggleShowEventsAction {
  return {
    type: TOGGLE_SHOW_EVENTS,
    course: courseId,
  }
}

// Options
export const TOGGLE_OPTION = 'TOGGLE_OPTION';

export interface ToggleOptionAction extends Action {
  type: typeof TOGGLE_OPTION;
  option: OptionName;
}

export function toggleOption (option: OptionName): ToggleOptionAction {
  return {
    type: TOGGLE_OPTION,
    option: option,
  }
}

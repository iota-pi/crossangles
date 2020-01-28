import { AdditionalEvent } from "../state";
import { CourseData, CourseId } from "../state/Course";
import { OptionName } from "../state/Options";
import { UserAction } from ".";

// Chosen courses
export const ADD_COURSE = 'ADD_COURSE';
export const REMOVE_COURSE = 'REMOVE_COURSE';
export const TOGGLE_WEB_STREAM = 'TOGGLE_WEB_STREAM';
export interface CourseAction extends UserAction {
  type: typeof ADD_COURSE | typeof REMOVE_COURSE | typeof TOGGLE_WEB_STREAM;
  course: CourseData;
}

export function addCourse (course: CourseData): CourseAction {
  return {
    type: ADD_COURSE,
    course,
    isUser: true,
  }
}

export function removeCourse (course: CourseData): CourseAction {
  return {
    type: REMOVE_COURSE,
    course,
    isUser: true,
  }
}

// Web streams
export function toggleWebStream (course: CourseData): CourseAction {
  return {
    type: TOGGLE_WEB_STREAM,
    course,
    isUser: true,
  }
}

// Custom courses
export const ADD_CUSTOM = 'ADD_CUSTOM';
export const UPDATE_CUSTOM = 'UPDATE_CUSTOM';
export const REMOVE_CUSTOM = 'REMOVE_CUSTOM';
export interface SimpleCustomAction extends UserAction {
  type: typeof ADD_CUSTOM | typeof REMOVE_CUSTOM;
  custom: CourseData;
}
export interface UpdateCustomAction extends UserAction {
  type: typeof UPDATE_CUSTOM;
  custom: CourseData;
}
export type CustomAction = SimpleCustomAction | UpdateCustomAction;

export function addCustom (custom: CourseData): CustomAction {
  return {
    type: ADD_CUSTOM,
    custom,
    isUser: true,
  }
}

export function removeCustom (custom: CourseData): CustomAction {
  return {
    type: REMOVE_CUSTOM,
    custom,
    isUser: true,
  }
}

export function updateCustom (custom: CourseData): CustomAction {
  return {
    type: UPDATE_CUSTOM,
    custom,
    isUser: true,
  }
}

// Events
export const TOGGLE_EVENT = 'TOGGLE_EVENT';
export interface EventAction extends UserAction {
  type: typeof TOGGLE_EVENT;
  event: AdditionalEvent;
}

export function toggleEvent (event: AdditionalEvent): EventAction {
  return {
    type: TOGGLE_EVENT,
    event,
    isUser: true,
  }
}

export const TOGGLE_SHOW_EVENTS = 'TOGGLE_SHOW_EVENTS';
export interface ToggleShowEventsAction extends UserAction {
  type: typeof TOGGLE_SHOW_EVENTS;
  course: CourseId;
}

export function toggleShowEvents (courseId: CourseId): ToggleShowEventsAction {
  return {
    type: TOGGLE_SHOW_EVENTS,
    course: courseId,
    isUser: true,
  }
}

// Options
export const TOGGLE_OPTION = 'TOGGLE_OPTION';

export interface ToggleOptionAction extends UserAction {
  type: typeof TOGGLE_OPTION;
  option: OptionName;
}

export function toggleOption (option: OptionName): ToggleOptionAction {
  return {
    type: TOGGLE_OPTION,
    option: option,
    isUser: true,
  }
}

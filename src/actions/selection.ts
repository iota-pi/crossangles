import { event } from 'react-ga';
import { Action } from 'redux';
import { CourseData, CourseId, getCourseId, AdditionalEvent, OptionName } from '../state';
import { CATEGORY } from '../analytics';
import { TimetableScoreConfig } from '../timetable/scoreTimetable';

// Chosen courses
export const ADD_COURSE = 'ADD_COURSE';
export const REMOVE_COURSE = 'REMOVE_COURSE';
export const TOGGLE_WEB_STREAM = 'TOGGLE_WEB_STREAM';

export interface CourseAction extends Action {
  type: typeof ADD_COURSE | typeof REMOVE_COURSE | typeof TOGGLE_WEB_STREAM;
  course: CourseData;
}

export function addCourse(course: CourseData): CourseAction {
  event({
    category: CATEGORY,
    action: 'Add Course',
    label: getCourseId(course),
  });

  return {
    type: ADD_COURSE,
    course,
  };
}

export function removeCourse(course: CourseData): CourseAction {
  event({
    category: CATEGORY,
    action: 'Remove Course',
    label: getCourseId(course),
  });

  return {
    type: REMOVE_COURSE,
    course,
  };
}

// Web streams
export function toggleWebStream(course: CourseData): CourseAction {
  event({
    category: CATEGORY,
    action: 'Toggle Web Stream',
    label: getCourseId(course),
  });

  return {
    type: TOGGLE_WEB_STREAM,
    course,
  };
}

// Events
export const TOGGLE_EVENT = 'TOGGLE_EVENT';

export interface EventAction extends Action {
  type: typeof TOGGLE_EVENT;
  event: AdditionalEvent;
}

export function toggleEvent(additionalEvent: AdditionalEvent): EventAction {
  event({
    category: CATEGORY,
    action: 'Toggle Event',
    label: additionalEvent.name,
  });

  return {
    type: TOGGLE_EVENT,
    event: additionalEvent,
  };
}

export const TOGGLE_SHOW_EVENTS = 'TOGGLE_SHOW_EVENTS';

export interface ToggleShowEventsAction extends Action {
  type: typeof TOGGLE_SHOW_EVENTS;
  course: CourseId;
}

export function toggleShowEvents(courseId: CourseId): ToggleShowEventsAction {
  event({
    category: CATEGORY,
    action: 'Toggle Show Events',
    label: courseId,
  });

  return {
    type: TOGGLE_SHOW_EVENTS,
    course: courseId,
  };
}

// Options
export const TOGGLE_OPTION = 'TOGGLE_OPTION';

export interface ToggleOptionAction extends Action {
  type: typeof TOGGLE_OPTION;
  option: OptionName;
  value?: boolean;
}

export function toggleOption(option: OptionName, value?: boolean): ToggleOptionAction {
  event({
    category: CATEGORY,
    action: 'Toggle Option',
    label: option,
  });

  return {
    type: TOGGLE_OPTION,
    option,
    value,
  };
}

// Score Config
export const SET_SCORE_CONFIG = 'SET_SCORE_CONFIG';

export interface SetScoreConfigAction extends Action {
  type: typeof SET_SCORE_CONFIG;
  config: TimetableScoreConfig;
}

export function setScoreConfig(config: TimetableScoreConfig): SetScoreConfigAction {
  return {
    type: SET_SCORE_CONFIG,
    config,
  };
}

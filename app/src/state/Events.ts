import { CourseMap, CourseId, CourseData, getCourseId } from './Course';

export interface AdditionalEvent {
  id: string,
  name: string,
  hideIfOnlyEvent?: boolean,
}


export const getEventId = (
  course: CourseData,
  component: string,
) => `${getCourseId(course)}~${component}`;

export function getEvents(course: CourseData): AdditionalEvent[] {
  if (!course.isAdditional) {
    return [];
  }

  const events: AdditionalEvent[] = course.streams.map(s => ({
    id: getEventId(course, s.component),
    name: s.component,
    hideIfOnlyEvent: s.options?.notOnlyEvent,
  }));
  const eventIds = events.map(e => e.id);
  const uniqueEvents = events.filter((e, i) => eventIds.indexOf(e.id) === i);
  return uniqueEvents;
}

export function getAutoSelectedEvents(
  courseMap: CourseMap,
  additional: CourseId[],
) {
  const courseList = additional.map(id => courseMap[id]);
  const filtered = courseList.filter(c => c.autoSelect);
  const events = [];
  for (const course of filtered) {
    events.push(...getEvents(course));
  }
  return events;
}

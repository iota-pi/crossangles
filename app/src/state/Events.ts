import { CourseMap, CourseId, CourseData, getCourseId } from './Course';

export interface AdditionalEvent {
  id: string,
  name: string,
}


export const getEvents = (course: CourseData): AdditionalEvent[] => {
  if (!course.isAdditional) {
    return [];
  }

  const events = course.streams.map(s => ({
    id: getEventId(course, s.component),
    name: s.component,
  }));
  const eventIds = events.map(e => e.id);
  const uniqueEvents = events.filter((e, i) => eventIds.indexOf(e.id) === i);
  return uniqueEvents;
}

export const getEventId = (course: CourseData, component: string) => {
  return `${getCourseId(course)}~${component}`;
}

export const getAutoSelectedEvents = (
  courseMap: CourseMap,
  additional: CourseId[],
) => {
  const courseList = additional.map(id => courseMap[id]);
  const filtered = courseList.filter(c => c.autoSelect);
  const events = [];
  for (const course of filtered) {
    events.push(...getEvents(course));
  }
  return events;
}

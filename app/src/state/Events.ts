import { CourseMap, CourseId, CourseData } from "./Course";

export const getEvents = (course: CourseData) => {
  if (!course.isAdditional) {
    return [];
  }

  const components = course.streams.map(s => s.component);
  const events = components.filter((c, i) => components.indexOf(c) === i);
  return events;
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

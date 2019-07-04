import { Course, Stream, CBSEvent, Session } from "../state";
import { notUndefined } from "../typeHelpers";

export interface Component {
  course: Course,
  name: string,
  streams: Stream[],
  streamSessions: Session[],
}

export function coursesToComponents (courses: Course[], events: CBSEvent[], allowFull: boolean): Component[] {
  // Group streams by component for each course
  let components: Component[] = []
  for (const course of courses) {
    let streamGroups = new Map<string, Stream[]>();

    for (let stream of course.streams) {
      if (!streamGroups.has(stream.component)) {
        streamGroups.set(stream.component, []);
      }
      const component = notUndefined(streamGroups.get(stream.component));

      // Skip any CBS activities which have been deselected
      if (course.code === 'CBS' && !events.includes(stream.component as CBSEvent)) {
        continue;
      }

      // Skip any web streams when not enabled for this course
      if (stream.web && !course.useWebStream) {
        continue;
      }

      // Skip any full streams if full streams aren't allowed
      if (stream.full && !allowFull) {
        continue;
      }

      // Group streams by their component
      component.push(stream);
    }

    // Add all components which don't have a web stream enabled for them
    const streamEntries = Array.from(streamGroups.entries());
    for (let [component, streams] of streamEntries) {
      if (!course.useWebStream || streams.filter(s => s.web).length === 0) {
        const streamSessions = streams.reduce((all, s) => all.concat(s.sessions), [] as Session[]);
        components.push({ name: component, streams, course, streamSessions });
      }
    }
  }

  return components;
}

export default coursesToComponents;

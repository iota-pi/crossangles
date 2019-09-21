import { Course, Stream, CBSEvent, ILinkedSession } from "../state";
import { notUndefined } from "../typeHelpers";

export interface Component {
  course: Course,
  name: string,
  streams: Stream[],
  streamSessions: ILinkedSession[],
}

export function coursesToComponents (
  courseList: Course[],
  events: CBSEvent[],
  allowFull: boolean
): Component[] {
  // Group streams by component for each course
  // NB: remove components for which the web stream is chosen
  let components: Component[] = [];
  for (const course of courseList) {
    let streamGroups = groupStreamsByComponent(course, events, allowFull);
    filterOutWebStreams(course, streamGroups);
    addComponentsTo(components, course, streamGroups);
  }

  return components;
}

const groupStreamsByComponent = (course: Course, events: CBSEvent[], allowFull: boolean) => {
  let streamGroups = new Map<string, Stream[]>();

  for (let stream of course.streams) {
    // Skip any CBS activities which have been deselected
    if (course.code === 'CBS' && !events.includes(stream.component as CBSEvent)) {
      continue;
    }

    // Skip any web streams when not enabled for this course
    if (stream.web && !course.useWebStream) {
      continue;
    }

    // Record this component (or retrieve previous record if it exists)
    if (!streamGroups.has(stream.component)) {
      streamGroups.set(stream.component, []);
    }
    const component = notUndefined(streamGroups.get(stream.component));

    // Skip any full streams if full streams aren't allowed
    if (stream.full && !allowFull) {
      continue;
    }

    // Group streams by their component
    component.push(stream);
  }

  return streamGroups;
}

export const filterOutWebStreams = (course: Course, streamGroups: Map<string, Stream[]>) => {
  const streamGroupsEntries = Array.from(streamGroups.entries());

  for (let [ component, streams ] of streamGroupsEntries) {
    // Remove component if web stream has been requested for this course AND this component has a web stream
    if (course.useWebStream && streams.filter(s => s.web).length > 0) {
      streamGroups.delete(component);
    }
  }
}

export const addComponentsTo = (components: Component[], course: Course, streamGroups: Map<string, Stream[]>) => {
  const streamGroupsEntries = Array.from(streamGroups.entries());

  for (let [component, streams] of streamGroupsEntries) {
    if (!course.useWebStream || streams.filter(s => s.web).length === 0) {
      const streamSessions: ILinkedSession[] = [];
      for (let stream of streams) {
        // const sessions = stream.sessions.map(ls => Session.from(ls, courses));
        const sessions = stream.sessions;
        streamSessions.push(...sessions);
      }

      // Add this component
      components.push({ name: component, streams, course, streamSessions });
    }
  }
}

export default coursesToComponents;

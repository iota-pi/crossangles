import { Course, Stream, CBSEvent, ILinkedSession, CourseId } from "../state";
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
  webStreams: Set<CourseId>,
  allowFull: boolean,
): Component[] {
  // Group streams by component for each course
  // NB: remove components for which the web stream is chosen
  let components: Component[] = [];
  for (const course of courseList) {
    let streamGroups = groupStreamsByComponent(course, events, webStreams, allowFull);
    filterOutWebStreams(course, streamGroups, webStreams);
    addComponentsTo(components, course, streamGroups, webStreams);
  }

  return components;
}

const groupStreamsByComponent = (
  course: Course,
  events: CBSEvent[],
  webStreams: Set<CourseId>,
  allowFull: boolean,
) => {
  let streamGroups = new Map<string, Stream[]>();

  for (let stream of course.streams) {
    // Skip any CBS activities which have been deselected
    if (course.code === 'CBS' && !events.includes(stream.component as CBSEvent)) {
      continue;
    }

    // Skip any web streams when not enabled for this course
    if (stream.web && !webStreams.has(course.id)) {
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

export const filterOutWebStreams = (
  course: Course,
  streamGroups: Map<string, Stream[]>,
  webStreams: Set<CourseId>,
) => {
  const streamGroupsEntries = Array.from(streamGroups.entries());

  for (let [ component, streams ] of streamGroupsEntries) {
    // Remove component if web stream has been requested for this course AND this component has a web stream
    if (webStreams.has(course.id) && streams.filter(s => s.web).length > 0) {
      streamGroups.delete(component);
    }
  }
}

export const addComponentsTo = (
  components: Component[],
  course: Course,
  streamGroups: Map<string, Stream[]>,
  webStreams: Set<CourseId>,
) => {
  const streamGroupsEntries = Array.from(streamGroups.entries());

  for (let [component, streams] of streamGroupsEntries) {
    if (!webStreams.has(course.id) || streams.filter(s => s.web).length === 0) {
      const streamSessions: ILinkedSession[] = [];
      for (let stream of streams) {
        const sessions = stream.sessions;
        streamSessions.push(...sessions);
      }

      // Add this component
      components.push({ name: component, streams, course, streamSessions });
    }
  }
}

export default coursesToComponents;

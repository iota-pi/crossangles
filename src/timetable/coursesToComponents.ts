import { Course, Stream, CBSEvent } from "../state";

export interface Component {
  course: Course,
  name: string,
  streams: Stream[],
}

export function coursesToComponents (courses: Course[], events: CBSEvent[], allowFull: boolean): Component[] {
  // Group streams by component for each course
  let components: Component[] = []
  for (const course of courses) {
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

      // Skip any full streams if full streams aren't allowed
      if (stream.full && !allowFull) {
        continue;
      }

      // Group streams by their component
      const priorComponent = streamGroups.get(stream.component);
      if (priorComponent !== undefined) {
        priorComponent.push(stream);
      } else {
        streamGroups.set(stream.component, [stream]);
      }
    }

    // Add all components which don't have a web stream enabled for them
    const streamEntries = Array.from(streamGroups.entries());
    for (let [component, streams] of streamEntries) {
      if (!course.useWebStream || streams.filter(s => s.web).length === 0) {
        components.push({ name: component, streams, course });
      }
    }
  }

  // Sort components in descending order number of streams
  // (during DFS, roll-backs are more likely to occur on less flexible streams)
  components.sort((a, b) => a.streams.length - b.streams.length);

  return components;
}

export default coursesToComponents;

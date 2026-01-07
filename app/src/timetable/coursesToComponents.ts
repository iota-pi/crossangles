import { notUndefined } from '../typeHelpers'
import {
  AdditionalEvent,
  CourseData,
  CourseId,
  getCourseId,
  getEventId,
  getSessions,
  getStreamId,
  LinkedSession,
  LinkedStream,
  linkStream,
  SessionData,
} from '../state'

export interface Component {
  course: CourseData,
  name: string,
  streams: LinkedStream[],
  streamSessions: SessionData[],
  id: string,
}

export function coursesToComponents(
  courseList: CourseData[],
  events: AdditionalEvent[],
  webStreams: CourseId[],
  fixedSessions: LinkedSession[],
  allowFull: boolean,
): Component[] {
  // Group streams by component for each course
  // NB: remove components for which the web stream is chosen
  const components: Component[] = []
  for (const course of courseList) {
    const streamGroups = groupStreamsByComponent(course, events, webStreams, allowFull)
    filterOutWebStreams(course, streamGroups, webStreams)
    isolateFixedStreams(streamGroups, fixedSessions)
    addComponentsTo(components, course, streamGroups, webStreams)
  }

  return components
}

function groupStreamsByComponent(
  course: CourseData,
  events: AdditionalEvent[],
  webStreams: CourseId[],
  allowFull: boolean,
) {
  const streamGroups = new Map<string, LinkedStream[]>()
  const eventIds = events.map(e => e.id)

  for (const stream of course.streams) {
    // Skip any additional events which have been deselected
    const eventId = getEventId(course, stream.component)
    if (course.isAdditional && !eventIds.includes(eventId)) {
      continue
    }

    // Skip any web streams when not enabled for this course
    if (stream.web && !webStreams.includes(getCourseId(course))) {
      continue
    }

    // Record this component (or retrieve previous record if it exists)
    if (!streamGroups.has(stream.component)) {
      streamGroups.set(stream.component, [])
    }
    const component = notUndefined(streamGroups.get(stream.component))

    // Skip any full streams if full streams aren't allowed
    if (stream.full && !allowFull) {
      continue
    }

    // Group streams by their component
    component.push(linkStream(course, stream))
  }

  return streamGroups
}

function filterOutWebStreams(
  course: CourseData,
  streamGroups: Map<string, LinkedStream[]>,
  webStreams: CourseId[],
) {
  // Remove all components which have a web stream option if this course has web streams enabled

  if (webStreams.includes(getCourseId(course))) {
    const streamGroupsEntries = Array.from(streamGroups.entries())

    for (const [component, streams] of streamGroupsEntries) {
      // Remove component if web stream has been requested AND this component has a web stream
      if (streams.some(s => s.web)) {
        streamGroups.delete(component)
      }
    }
  }
}

function isolateFixedStreams(
  streamGroups: Map<string, LinkedStream[]>,
  fixedSessions: LinkedSession[],
) {
  const streamGroupsEntries = Array.from(streamGroups.entries())
  const fixedStreamIds = new Set(fixedSessions.map(s => s.stream.id))

  for (const [component, streams] of streamGroupsEntries) {
    for (const stream of streams) {
      if (fixedStreamIds.has(stream.id)) {
        streamGroups.set(component, [stream])
        break
      }
    }
  }
}

function addComponentsTo(
  components: Component[],
  course: CourseData,
  streamGroups: Map<string, LinkedStream[]>,
  webStreams: CourseId[],
) {
  const streamGroupsEntries = Array.from(streamGroups.entries())

  for (const [component, streams] of streamGroupsEntries) {
    const courseId = getCourseId(course)
    if (!webStreams.includes(courseId) || streams.every(s => !s.web)) {
      const idParts: string[] = [courseId, component]
      const streamSessions: SessionData[] = []
      for (const stream of streams) {
        const sessions = getSessions(course, stream)
        streamSessions.push(...sessions)
        idParts.push(getStreamId(course, stream))
      }
      const id = idParts.join('~')

      // Add this component
      components.push({ name: component, streams, course, streamSessions, id })
    }
  }
}

export default coursesToComponents

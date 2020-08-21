import { CourseData } from '../../app/src/state/Course';
import { DeliveryType, StreamData } from '../../app/src/state/Stream';

export function removeDuplicateStreams(course: CourseData) {
  const mapping = getStreamGroupMapping(course);

  // For each set of streams with identical component and times, remove all but the emptiest stream
  for (const streamGroup of Array.from(mapping.values())) {
    const emptiest = emptiestStream(streamGroup);
    emptiest.delivery = mergeDeliveryType(streamGroup);
    for (const stream of streamGroup) {
      if (stream !== emptiest) {
        const index = course.streams.indexOf(stream);
        course.streams.splice(index, 1);
      }
    }
  }
}

function getStreamGroupMapping(course: CourseData): Map<string, StreamData[]> {
  const mapping = new Map<string, StreamData[]>();
  for (const stream of course.streams) {
    const times = stream.times.map(t => t.time);
    const key = `${stream.component}[${times}]`;
    const currentGroup = mapping.get(key) || [];
    const newGroup = currentGroup.concat(stream);
    mapping.set(key, newGroup);
  }
  return mapping;
}

function emptiestStream(streams: StreamData[]) {
  let bestStream = streams[0];
  let bestRatio = Infinity;
  for (const stream of streams) {
    if (stream.enrols) {
      const ratio = stream.enrols[0] / stream.enrols[1];
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestStream = stream;
      }
    }
  }

  return bestStream;
}

export function mergeDeliveryType(streams: StreamData[]): DeliveryType | undefined {
  // Merges delivery types of multiple streams
  let delivery: DeliveryType | undefined;
  for (const stream of streams) {
    if (stream.delivery !== undefined) {
      if (delivery === undefined) {
        delivery = stream.delivery;
      } else if (stream.delivery !== delivery) {
        delivery = DeliveryType.either;
        break;
      }
    }
  }
  return delivery;
}

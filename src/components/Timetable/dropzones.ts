import { DropzonePlacement } from './DropzonePlacement';
import { LinkedSession, linkStream, LinkedStream, getDuration } from '../../state';
import { findFreeDepth } from './timetableUtil';


export function dropzoneCompare(a: DropzonePlacement, b: DropzonePlacement) {
  const daySort = +(a.dayIndex > b.dayIndex) - +(a.dayIndex < b.dayIndex);
  const startSort = +(a.session.start > b.session.start) - +(a.session.start < b.session.start);
  const endSort = +(a.session.end < b.session.end) - +(a.session.end > b.session.end);
  return daySort || startSort || endSort;
}


export class DropzoneManager {
  getDropzones(dragging: LinkedSession, includeFull: boolean): DropzonePlacement[] {
    const { course, stream: { component }, index } = dragging;
    const allStreams = course.streams.map(s => linkStream(course, s));
    const filteredStreams = this.filterStreams(allStreams, component, index, includeFull);

    const dropzones = this.streamsToDropzones(filteredStreams, index);
    dropzones.sort(dropzoneCompare);
    const uniqueDropzones: DropzonePlacement[] = [dropzones[0]];
    for (let i = 1; i < dropzones.length; i++) {
      if (dropzoneCompare(dropzones[i - 1], dropzones[i]) !== 0) {
        uniqueDropzones.push(dropzones[i]);
      }
    }
    this.calculateClashDepth(uniqueDropzones);

    return uniqueDropzones;
  }

  filterStreams(
    streams: LinkedStream[],
    component: string,
    index: number,
    includeFull: boolean,
  ): LinkedStream[] {
    return streams.filter(s => {
      // Skip streams that are for a different component
      if (s.component !== component) { return false; }

      // Skip streams which don't have enough sessions
      if (index >= s.sessions.length) { return false; }

      // Skip full streams unless asked to include them
      if (s.full && !includeFull) { return false; }

      return true;
    });
  }

  streamsToDropzones(streams: LinkedStream[], index: number): DropzonePlacement[] {
    return streams.map(s => {
      const session = s.sessions[index];
      return new DropzonePlacement(session);
    });
  }

  filterDropzones(dropzones: DropzonePlacement[], dragging: LinkedSession): DropzonePlacement[] {
    const selected = new Map<string, DropzonePlacement>();
    const targetDuration = getDuration(dragging);

    const sortedDropzones = dropzones.slice().sort((a, b) => b.duration - a.duration);
    for (const dropzone of sortedDropzones) {
      const id = dropzone.id;
      const other = selected.get(id);
      let select = false;
      if (other) {
        if (dropzone.session.id === dragging.id) {
          select = true;
        } else if (dropzone.duration === targetDuration && other.duration !== targetDuration) {
          select = true;
        }
      } else {
        select = true;
      }

      if (select) {
        selected.set(id, dropzone);
      }
    }

    return dropzones.filter(d => selected.get(d.id) === d);
  }

  calculateClashDepth(
    dropzones: DropzonePlacement[],
  ) {
    for (let i = 0; i < dropzones.length; ++i) {
      const dropzone1 = dropzones[i];
      const clashingZones = new Set<number>();
      for (let j = 0; j < i; ++j) {
        const dropzone2 = dropzones[j];
        if (dropzone2.session.day !== dropzone1.session.day) continue;
        if (dropzone2.session.end <= dropzone1.session.start) continue;

        clashingZones.add(dropzone2.clashDepth);
      }

      dropzone1.clashDepth = findFreeDepth(clashingZones);
    }
  }
}

const dm = new DropzoneManager();
export const getDropzones = dm.getDropzones.bind(dm);

import { DropzonePlacement } from './DropzonePlacement';
import { LinkedSession, linkStream, LinkedStream, getDuration } from '../../state';


export class DropzoneManager {
  getDropzones (dragging: LinkedSession, includeFull: boolean): DropzonePlacement[] {
    const { course, stream: { component }, index } = dragging;
    const allStreams = course.streams.map(s => linkStream(course, s));
    const filteredStreams = this.filterStreams(allStreams, component, index, includeFull);

    const dropzones = this.streamsToDropzones(filteredStreams, index);
    const uniqueDropzones = this.filterDropzones(dropzones, dragging);

    return uniqueDropzones;
  }

  filterStreams (
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

  streamsToDropzones (streams: LinkedStream[], index: number): DropzonePlacement[] {
    return streams.map(s => {
      const session = s.sessions[index];
      return new DropzonePlacement(session);
    });
  }

  filterDropzones (dropzones: DropzonePlacement[], dragging: LinkedSession): DropzonePlacement[] {
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
}

const dm = new DropzoneManager();
export const getDropzones = dm.getDropzones.bind(dm);

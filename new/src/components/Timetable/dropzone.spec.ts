import { DropzoneManager } from './dropzones';
import { LinkedStream } from '../../state';
import { getLinkedStream, getLinkedSession } from '../../test_util';
import { DropzonePlacement } from './DropzonePlacement';

describe('getDropzones', () => {
  it('returns unique streams', () => {
    // Setup
    const dm = new DropzoneManager();
    const filteredStreams: LinkedStream[] = [];
    dm.filterStreams = jest.fn().mockReturnValue(filteredStreams);
    const streamsToDropzones: DropzonePlacement[] = [];
    dm.streamsToDropzones = jest.fn().mockReturnValue(streamsToDropzones);
    const filteredDropzones: DropzonePlacement[] = [];
    dm.filterDropzones = jest.fn().mockReturnValue(filteredDropzones);
    const dragging = getLinkedSession();

    // Exercise
    const result = dm.getDropzones(dragging, false);

    // Verify
    expect(result).toBe(filteredDropzones);
    expect(dm.filterStreams).toHaveBeenCalledTimes(1);
    expect(dm.streamsToDropzones).toHaveBeenCalledTimes(1);
    expect(dm.filterDropzones).toHaveBeenCalledTimes(1);
  });
});

describe('filterStreams', () => {
  it('filterStreams([], ...) = []', () => {
    const dm = new DropzoneManager();
    const result = dm.filterStreams([], 'LEC', 0, false);
    expect(result).toEqual([]);
  });

  it('ignores other components', () => {
    const keepStreams: LinkedStream[] = [getLinkedStream(0)];
    const skipStreams: LinkedStream[] = [getLinkedStream(2)];
    const streams = [...keepStreams, ...skipStreams];
    const dm = new DropzoneManager();
    const result = dm.filterStreams(streams, keepStreams[0].component, 0, false);
    expect(result).toEqual(keepStreams);
  });

  it('ignores streams without enough sessions', () => {
    const component = 'TLA';
    const keepStreams: LinkedStream[] = [getLinkedStream(0, { component })];
    const skipStreams: LinkedStream[] = [getLinkedStream(2, { component })];
    const streams = [...keepStreams, ...skipStreams];
    const dm = new DropzoneManager();
    expect(dm.filterStreams(streams, component, 1, false)).toEqual(keepStreams);
    expect(dm.filterStreams(streams, component, 2, false)).toEqual(keepStreams);
    expect(dm.filterStreams(streams, component, 3, false)).toEqual([]);
  });

  it('skips full classes if includeFull = False', () => {
    const component = 'TLA';
    const keepStreams: LinkedStream[] = [getLinkedStream(0, { component, full: false })];
    const skipStreams: LinkedStream[] = [getLinkedStream(2, { component, full: true })];
    const streams = [...keepStreams, ...skipStreams];
    const dm = new DropzoneManager();
    expect(dm.filterStreams(streams, component, 0, false)).toEqual(keepStreams);
  });

  it('includes full classes if includeFull = True', () => {
    const component = 'TLA';
    const streams: LinkedStream[] = [
      getLinkedStream(0, { component, full: false }),
      getLinkedStream(2, { component, full: true }),
    ];
    const dm = new DropzoneManager();
    expect(dm.filterStreams(streams, component, 0, true)).toEqual(streams);
  });
});

describe('streamsToDropzones', () => {
  it('returns array of dropzones', () => {
    const dm = new DropzoneManager();
    const streams: LinkedStream[] = [
      getLinkedStream(0),
      getLinkedStream(1),
    ];
    const index = 1;
    const result = dm.streamsToDropzones(streams, index);
    expect(result).toHaveLength(streams.length);
    for (let i = 0; i < streams.length; ++i) {
      expect(result[i]).toBeInstanceOf(DropzonePlacement);
      expect(result[i].session).toBe(streams[i].sessions[index]);
    }
  });
});

describe('filterDropzones', () => {
  it('removes dropzones with duplicate start times', () => {
    const dm = new DropzoneManager();
    const dropzones: DropzonePlacement[] = [
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 12, end: 13 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'T', start: 11, end: 12 })),
    ];
    const result = dm.filterDropzones(dropzones, getLinkedSession(1));
    expect(result).toHaveLength(3);
    expect(result).toContain(dropzones[0]);
    expect(result).not.toContain(dropzones[1]);
    expect(result).toContain(dropzones[2]);
    expect(result).toContain(dropzones[3]);
  });

  it('prioritises longer duration', () => {
    const dm = new DropzoneManager();
    const dropzones: DropzonePlacement[] = [
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'H', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'H', start: 11, end: 15 })),
    ];
    const result = dm.filterDropzones(dropzones, getLinkedSession(1, 0, { day: 'F', start: 12, end: 15 }));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(dropzones[1]);
  });

  it('prioritises dropzones right duration', () => {
    const dm = new DropzoneManager();
    const dropzones: DropzonePlacement[] = [
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'H', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(1, 0, { day: 'H', start: 11, end: 13 })),
      new DropzonePlacement(getLinkedSession(2, 0, { day: 'H', start: 11, end: 14 })),
      new DropzonePlacement(getLinkedSession(3, 0, { day: 'H', start: 11, end: 15 })),
    ];
    const result = dm.filterDropzones(dropzones, getLinkedSession(1, 1, { day: 'F', start: 12, end: 15 }));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(dropzones[2]);
  });

  it('prioritises the dropzone of the same session', () => {
    const dm = new DropzoneManager();
    const dropzones: DropzonePlacement[] = [
      new DropzonePlacement(getLinkedSession(0, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(1, 0, { day: 'M', start: 11, end: 12 })),
      new DropzonePlacement(getLinkedSession(2, 0, { day: 'M', start: 11, end: 12 })),
    ];
    const result = dm.filterDropzones(dropzones.slice(), dropzones[1].session);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(dropzones[1]);
  });
});

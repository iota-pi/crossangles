import { SessionPlacementFactory } from './SessionPlacement';
import { CLASH_OFFSET_X, CLASH_OFFSET_Y } from './timetableUtil';
import SessionPosition from './SessionPosition';

const session = {
  start: 10,
  end: 11,
  day: 'W',
};
const dimensions = {
  startHour: 9,
  dimensions: {
    width: 1000,
  },
};
const factory = new SessionPlacementFactory(dimensions);

jest.mock('./SessionPosition');

describe('SessionPlacement', () => {
  test('can initialise instance with expected base position', () => {
    const p = factory.create(session);
    expect(p.session).toBe(session);

    const cellWidth = (1000 - 60) / 5;
    const expectedX = 61 + cellWidth * 2;
    const expectedY = 51 + 50;
    expect(p.basePlacement.x).toBe(expectedX);
    expect(p.basePlacement.y).toBe(expectedY);
    expect(p.basePlacement.width).toBe(cellWidth - 1);
    expect(p.basePlacement.height).toBe(49);
  });

  test('getters return expected initial values', () => {
    const p = factory.create(session);
    expect(p.isSnapped).toBe(true);
    expect(p.isDragging).toBe(false);
    expect(p.isRaised).toBe(false);
  });

  test('begin drag', () => {
    const p = factory.create(session);
    p.clashDepth = 2;
    p.drag();
    expect(p.isSnapped).toBe(false);
    expect(p.isDragging).toBe(true);
    expect(p.isRaised).toBe(false);
    expect(p._offset).toEqual(
      { x: CLASH_OFFSET_X * 2, y: CLASH_OFFSET_Y * 2 }
    );
  });

  test('move', () => {
    const p = factory.create(session);

    p.move({ x: 10, y: -10 });
    p.move({ x: 5, y: 10 });

    expect(p._offset).toEqual({ x: 15, y: 0 });
  });

  test('drop', () => {
    const p = factory.create(session);
    p.drag();

    p.drop();

    expect(p._isDragging).toBe(false);
    expect(p._isSnapped).toBe(false);
    expect(p._isRaised).toBe(false);
  });

  test('snap', () => {
    const p = factory.create(session);
    p._offset = { x: 15, y: 0};
    p._isSnapped = false;
    p._isRaised = true;

    p.snap();

    expect(p._offset).toEqual({ x: 0, y: 0 });
    expect(p.isSnapped).toBe(true);
    expect(p.isRaised).toBe(false);
  });

  test('snapping when already snapped changes nothing', () => {
    const p = factory.create(session);

    p.snap();

    expect(p._offset).toEqual({ x: 0, y: 0 });
    expect(p.isSnapped).toBe(true);
    expect(p.isRaised).toBe(false);
  });

  test('raise', () => {
    const p = factory.create(session);

    p.raise();

    expect(p.isRaised).toBe(true);
  });

  test('lower', () => {
    const p = factory.create(session);
    p._isRaised = true;

    p.lower();

    expect(p.isRaised).toBe(false);
  });

  test('displace', () => {
    const p = factory.create(session);
    p.displace();
    expect(p.isSnapped).toBe(false);
    expect(p._offset).not.toEqual({ x: 0, y: 0 });
  });

  test('shouldDisplace', () => {
    const p = factory.create(session);

    p.session.stream = { full: false };
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p._isSnapped = false;
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p.session.stream.full = true;
    expect(p.shouldDisplace(false)).toBe(false);
    expect(p.shouldDisplace(true)).toBe(false);

    p._isSnapped = true;
    expect(p.shouldDisplace(false)).toBe(true);
    expect(p.shouldDisplace(true)).toBe(false);
  });

  test('position', () => {
    const getBasePosition = jest.fn().mockReturnValue({ x: 1, y: 2 });
    const getClashOffset = jest.fn().mockReturnValue({ x: 2, y: 3 });
    const getRaisedOffset = jest.fn().mockReturnValue({ x: 3, y: 4 });
    const getZ = jest.fn().mockReturnValue(5);
    SessionPosition.getBasePosition = getBasePosition.bind(SessionPosition);
    SessionPosition.getClashOffset = getClashOffset.bind(SessionPosition);
    SessionPosition.getRaisedOffset = getRaisedOffset.bind(SessionPosition);
    SessionPosition.getZ = getZ.bind(SessionPosition);
    const p = factory.create(session);
    p.clashDepth = 7;
    p._isRaised = true;
    expect(p.position).toEqual({ x: 6, y: 9, z: 5 });

    expect(getBasePosition).toHaveBeenCalledTimes(1);
    expect(getBasePosition).toHaveBeenLastCalledWith(p.basePlacement, p.boundedOffset);

    expect(getClashOffset).toHaveBeenCalledTimes(1);
    expect(getClashOffset).toHaveBeenLastCalledWith(p.clashDepth);

    expect(getRaisedOffset).toHaveBeenCalledTimes(1);
    expect(getRaisedOffset).toHaveBeenLastCalledWith(p.isRaised);

    expect(getZ).toHaveBeenCalledTimes(1);
    expect(getZ).toHaveBeenLastCalledWith(p.isSnapped, p.clashDepth);
  });
});

import SessionManager from './SessionManager';
import SessionPlacement from './SessionPlacement';
import { getSessionPlacement, getDimensions } from '../../test_util';
import { LinkedSession } from '../../state/Session';
import { LinkedStream } from '../../state/Stream';

describe('SessionManager basic functionality', () => {
  test('get throws if not found', () => {
    const s = new SessionManager();
    expect(() => s.get('a')).toThrowError(TypeError);
  })

  test('getMaybe returns undefined if not found', () => {
    const s = new SessionManager();
    expect(s.getMaybe('a')).toBe(undefined);
  })

  test('get returns found placement', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    s.set(p.session.id, p);
    expect(s.get(p.session.id)).toBe(p);
  })

  test('getMaybe returns found placement', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    s.set(p.session.id, p);
    expect(s.getMaybe(p.session.id)).toBe(p);
  })

  test('has returns true when found', () => {
    const s = new SessionManager();
    s.set('a', getSessionPlacement());
    expect(s.has('a')).toBe(true);
  })

  test('has returns false when not found', () => {
    const s = new SessionManager();
    expect(s.has('a')).toBe(false);
  })

  test('set advances version and calls callback', () => {
    const s = new SessionManager();
    const v = s.version;
    const cb = jest.fn();
    s.callback = cb;
    s.set('a', getSessionPlacement());
    expect(s.version).toBe(v + 1);
    expect(cb).toHaveBeenCalledTimes(0);
  })

  test('set adds items in expected order', () => {
    const s = new SessionManager();
    s.set('o', getSessionPlacement(0));
    s.set('r', getSessionPlacement(1));
    s.set('d', getSessionPlacement(2));
    expect(s.order).toEqual(['o', 'r', 'd']);
  })

  test('order is not mutated by set', () => {
    const s = new SessionManager();
    s.set('a', getSessionPlacement(0));
    const initialOrder = s.order;
    s.set('b', getSessionPlacement(1));
    expect(s.order).not.toBe(initialOrder);
  })

  test('order is not mutated by remove', () => {
    const s = new SessionManager();
    s.set('a', getSessionPlacement());
    const initialOrder = s.order;
    s.remove('a');
    expect(s.order).not.toBe(initialOrder);
  })

  test('getOrder returns expected values', () => {
    const s = new SessionManager();
    s.set('o', getSessionPlacement(0));
    s.set('r', getSessionPlacement(1));
    s.set('d', getSessionPlacement(2));
    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('r')).toBe(1);
    expect(s.getOrder('d')).toBe(2);
    expect(s.getOrder('-')).toBe(-1);
  })

  test('getSession doesn\'t affect the version', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    s.set(p.session.id, p);
    const v = s.version;
    s.getSession(p.session.id);
    expect(s.version).toBe(v);
  })

  test('getSession returns session', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    s.set(p.session.id, p);
    expect(s.getSession(p.session.id)).toBe(p.session);
  })

  test('getSession throws if session id doesn\'t exist', () => {
    const s = new SessionManager();
    expect(() => s.getSession('a')).toThrow();
  })

  test('orderSessions gives expected result', () => {
    const s = new SessionManager();
    const placements = [
      getSessionPlacement(0),
      getSessionPlacement(1),
      getSessionPlacement(2),
    ];
    s.set('a', placements[0]);
    s.set('b', placements[1]);
    s.set('c', placements[2]);
    const v = s.version;
    expect(s.orderSessions).toEqual(placements.map(p => p.session));
    expect(s.version).toBe(v);
  })

  test('remove removes from order', () => {
    const s = new SessionManager();
    s.set('o', getSessionPlacement(0));
    s.set('r', getSessionPlacement(1));
    s.set('d', getSessionPlacement(2));
    const v = s.version;
    const cb = jest.fn();
    s.callback = cb;
    s.remove('r');
    expect(s.version).toBe(v + 1);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('d')).toBe(1);
    expect(s.getOrder('r')).toBe(-1);
    expect(s.order).toEqual(['o', 'd']);
  })

  test('remove doesn\'t if session doesn\'t exist', () => {
    const s = new SessionManager();
    const v = s.version;
    s.remove('a');
    expect(s.version).toBe(v + 1);
  })

  test('update clash depth', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.clashDepth = 0;
    s.set('a', p);
    const v = s.version;
    s.setClashDepth('a', 2);
    expect(p.clashDepth).toBe(2);
    expect(s.version).toBe(v + 1);
  })

  test('can drag a session', () => {
    const s = new SessionManager();
    let p1 = getSessionPlacement(1);
    let p2 = getSessionPlacement(2);
    p1.drag = jest.fn();
    p2.drag = jest.fn();
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    const v = s.version;
    s.drag(p1.session.id);
    expect(p1.drag).toHaveBeenCalledTimes(1);
    expect(p2.drag).not.toHaveBeenCalled();
    expect(s.version).toBe(v + 1);
  })

  test('dragging raises linked sessions', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0);
    const p2 = getSessionPlacement(0, 1);
    const p3 = getSessionPlacement(0, 2);
    const p4 = getSessionPlacement(1);
    p1.drag = jest.fn();
    p1.raise = jest.fn();
    p2.raise = jest.fn();
    p3.raise = jest.fn();
    p4.raise = jest.fn();
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);
    s.set(p4.session.id, p4);
    const v = s.version;
    s.drag(p1.session.id);
    expect(p1.raise).not.toHaveBeenCalled();
    expect(p2.raise).toHaveBeenCalledTimes(1);
    expect(p3.raise).toHaveBeenCalledTimes(1);
    expect(p4.raise).toHaveBeenCalledTimes(0);
    expect(s.version).toBe(v + 1);
  })

  test('can move session with given delta', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.move = jest.fn();
    s.set(p.session.id, p);
    const v = s.version;
    const delta = { x: -10, y: 10 };
    s.move(p.session.id, delta);
    expect(p.move).toHaveBeenCalledTimes(1);
    expect(p.move).toHaveBeenCalledWith(delta);
    expect(s.version).toBe(v + 1);
  })

  test('can drop a session', () => {
    const s = new SessionManager();
    const updateScore = jest.spyOn(s as any, 'updateScore').mockImplementation();
    const p1 = getSessionPlacement(1);
    const p2 = getSessionPlacement(2);
    p1.drop = jest.fn();
    p2.drop = jest.fn();
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    const v = s.version;
    s.drop(p1.session.id, null, getDimensions(), 10);
    expect(p1.drop).toHaveBeenCalledTimes(1);
    expect(p2.drop).not.toHaveBeenCalled();
    expect(updateScore).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('dropping lowers linked sessions', () => {
    const s = new SessionManager();
    const updateScore = jest.spyOn(s as any, 'updateScore').mockImplementation();
    const p1 = getSessionPlacement(0, 0);
    const p2 = getSessionPlacement(0, 1);
    const p3 = getSessionPlacement(0, 2);
    p1.drop = jest.fn();
    p1.lower = jest.fn();
    p2.lower = jest.fn();
    p3.lower = jest.fn();
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);
    const v = s.version;
    s.drop(p1.session.id, null, getDimensions(), 10);
    expect(p1.lower).not.toHaveBeenCalled();
    expect(p2.lower).toHaveBeenCalledTimes(1);
    expect(p3.lower).toHaveBeenCalledTimes(1);
    expect(updateScore).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can raise a session', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.raise = jest.fn();
    s.set(p.session.id, p);
    const v = s.version;
    s['raise'](p.session.id);
    expect(p.raise).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can lower a session', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.lower = jest.fn();
    s.set(p.session.id, p);
    const v = s.version;
    s['lower'](p.session.id);
    expect(p.lower).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can snap all sessions in a stream', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0, 0);
    const p2 = getSessionPlacement(0, 1);
    const p3 = getSessionPlacement(0, 2);
    p1.snap = jest.fn();
    p2.snap = jest.fn();
    p3.snap = jest.fn();

    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);
    const v = s.version;
    s.snapStream(p1.session.id);
    expect(p1.snap).toHaveBeenCalledTimes(1);
    expect(p2.snap).toHaveBeenCalledTimes(1);
    expect(p3.snap).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can snap one session', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.snap = jest.fn();
    s.set(p.session.id, p);
    const v = s.version;
    s.snap(p.session.id);
    expect(p.snap).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can displace one session', () => {
    const s = new SessionManager();
    const p = getSessionPlacement();
    p.displace = jest.fn();
    s.set(p.session.id, p);
    const v = s.version;
    s.displace(p.session.id);
    expect(p.displace).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })
})


describe('bumping sessions and streams', () => {
  test('can bump a stream', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0, 0);
    const p2 = getSessionPlacement(1);
    const p3 = getSessionPlacement(0, 2);
    const p4 = getSessionPlacement(2);
    const p5 = getSessionPlacement(0, 1);
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);
    s.set(p4.session.id, p4);
    s.set(p5.session.id, p5);
    const v = s.version;

    s.bumpStream(p3.session.id);

    const expectedOrder = [p2, p4, p1, p5, p3];
    expect(s.order).toEqual(expectedOrder.map(p => p.session.id));
    expect(s.version).toBe(v + 1);
  })

  test('can bump a session from the start and change version', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0);
    const p2 = getSessionPlacement(1);
    const p3 = getSessionPlacement(2);
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);

    const v = s.version;
    const o = s.order;
    s.bumpSession(p1.session.id);

    const expectedOrder = [p2, p3, p1];
    expect(s.order).toEqual(expectedOrder.map(p => p.session.id));
    expect(s.order).not.toBe(o);
    expect(s.version).toBe(v + 1);
  })

  test('can bump a session from the middle without mutating order', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0);
    const p2 = getSessionPlacement(1);
    const p3 = getSessionPlacement(2);
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);

    s.bumpSession(p2.session.id);

    const expectedOrder = [p1, p3, p2];
    expect(s.order).toEqual(expectedOrder.map(p => p.session.id));
  })

  test('can bump a session from the end', () => {
    const s = new SessionManager();
    const p1 = getSessionPlacement(0);
    const p2 = getSessionPlacement(1);
    const p3 = getSessionPlacement(2);
    s.set(p1.session.id, p1);
    s.set(p2.session.id, p2);
    s.set(p3.session.id, p3);

    s.bumpSession(p3.session.id);

    const expectedOrder = [p1, p2, p3];
    expect(s.order).toEqual(expectedOrder.map(p => p.session.id));
  })

  test('bumping non-existent session throws', () => {
    const s = new SessionManager();
    const v = s.version;
    expect(() => s.bumpSession('a')).toThrow();
    expect(s.version).toBe(v);
  })

  test('bumping stream for non-existent session throws', () => {
    const s = new SessionManager();
    const v = s.version;
    expect(() => s.bumpStream('a')).toThrow();
    expect(s.version).toBe(v);
  })
})


describe('constructor, data, and from', () => {
  test('can copy using constructor', () => {
    const s1 = new SessionManager();
    const p1 = getSessionPlacement(0);
    const p2 = getSessionPlacement(1);
    const p3 = getSessionPlacement(2);
    s1.set(p1.session.id, p1);
    s1.set(p2.session.id, p2);
    const v = s1.version;

    const s2 = new SessionManager(s1);
    s1.set(p3.session.id, p3);

    expect(s2['_order']).toEqual([p1.session.id, p2.session.id]);
    expect(Array.from(s2['map'].entries())).toEqual(
      [[p1.session.id, p1], [p2.session.id, p2]]
    );
    expect(s2.version).toBe(v);
  })
})


describe('snapSessionTo', () => {
  const oldSessions = [
    { id: 'a-0' },
    { id: 'b-0' },
  ] as LinkedSession[];
  oldSessions[0].stream = { sessions: oldSessions, id: 'a' } as LinkedStream;
  const newSessions = [
    { id: 'c-0', stream: { id: 'c' } },
    { id: 'd-0' },
  ] as LinkedSession[];
  let s: SessionManager;

  beforeEach(() => {
    s = new SessionManager();
    s.set('a-0', new SessionPlacement(oldSessions[0]));
    s.set('b-0', new SessionPlacement(oldSessions[1]));
  })

  test('increments version', () => {
    const v = s.version;
    s['snapSessionTo'](
      'a-0',
      newSessions,
    );

    expect(s.version).toBe(v + 1);
  })

  test('replaces old sessions with new', () => {
    s['snapSessionTo'](
      'a-0',
      newSessions,
    );

    expect(s.has('a-0')).toBe(false);
    expect(s.has('b-0')).toBe(false);
    expect(s.has('c-0')).toBe(true);
    expect(s.has('d-0')).toBe(true);
  })

  test('touches new sessions', () => {
    s['snapSessionTo'](
      'a-0',
      newSessions,
    );

    expect(s.get('c-0').touched).toBe(true);
    expect(s.get('d-0').touched).toBe(true);
  })

  test('doesn\'t touch sessions if unchanged', () => {
    s['snapSessionTo'](
      'a-0',
      oldSessions,
    );

    expect(s.get('a-0').touched).toBe(false);
    expect(s.get('b-0').touched).toBe(false);
  })

  test('new sessions are snapped', () => {
    const c = new SessionPlacement(oldSessions[0]);
    const d = new SessionPlacement(oldSessions[1]);
    c['_offset'] = { x: 10, y: 10 };
    d['_offset'] = { x: 20, y: 0 };
    s.set('c-0', c);
    s.set('d-0', d);

    s['snapSessionTo'](
      'a-0',
      newSessions,
    );

    expect(s.get('c-0')['_offset']).toEqual({ x: 0, y: 0 });
    expect(s.get('d-0')['_offset']).toEqual({ x: 0, y: 0 });
  })
})


describe('update', () => {

})

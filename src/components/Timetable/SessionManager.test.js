import SessionManager from './SessionManager';
import SessionPlacement from './SessionPlacement';

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
    const p = {};
    s.set('a', p);
    expect(s.get('a')).toBe(p);
  })

  test('getMaybe returns found placement', () => {
    const s = new SessionManager();
    const p = {};
    s.set('a', p);
    expect(s.getMaybe('a')).toBe(p);
  })

  test('has returns true when found', () => {
    const s = new SessionManager();
    s.set('a', {});
    expect(s.has('a')).toBe(true);
  })

  test('has returns false when not found', () => {
    const s = new SessionManager();
    expect(s.has('a')).toBe(false);
  })

  test('set advances version', () => {
    const s = new SessionManager();
    const v = s.version;
    s.set('a', {});
    expect(s.version).toBe(v + 1);
  })

  test('set adds items in expected order', () => {
    const s = new SessionManager();
    s.set('o', {});
    s.set('r', {});
    s.set('d', {});
    expect(s.order).toEqual(['o', 'r', 'd']);
  })

  test('order is not mutated by set', () => {
    const s = new SessionManager();
    s.set('a', {});
    const initialOrder = s.order;
    s.set('b', {});
    expect(s.order).not.toBe(initialOrder);
  })

  test('order is not mutated by remove', () => {
    const s = new SessionManager();
    s.set('a', {});
    const initialOrder = s.order;
    s.remove('a');
    expect(s.order).not.toBe(initialOrder);
  })

  test('getOrder returns expected values', () => {
    const s = new SessionManager();
    s.set('o', {});
    s.set('r', {});
    s.set('d', {});
    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('r')).toBe(1);
    expect(s.getOrder('d')).toBe(2);
    expect(s.getOrder('-')).toBe(-1);
  })

  test('getSession doesn\'t affect the version', () => {
    const s = new SessionManager();
    s.set('a', {});
    const v = s.version;
    s.getSession('a');
    expect(s.version).toBe(v);
  })

  test('getSession returns session', () => {
    const s = new SessionManager();
    const session = {};
    s.set('a', { session });
    expect(s.getSession('a')).toBe(session);
  })

  test('getSession throws if session id doesn\'t exist', () => {
    const s = new SessionManager();
    expect(() => s.getSession('a')).toThrowError(TypeError);
  })

  test('orderSessions gives expected result', () => {
    const s = new SessionManager();
    const sessions = [{}, {}, {}];
    s.set('a', { session: sessions[0] });
    s.set('b', { session: sessions[1] });
    s.set('c', { session: sessions[2] });
    const v = s.version;
    expect(s.orderSessions).toEqual(sessions);
    expect(s.version).toBe(v);
  })

  test('remove removes from order', () => {
    const s = new SessionManager();
    s.set('o', {});
    s.set('r', {});
    s.set('d', {});
    s.remove('r');
    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('d')).toBe(1);
    expect(s.getOrder('r')).toBe(-1);
    expect(s.order).toEqual(['o', 'd']);
  })

  test('remove does nothing (and does not throw) if session doesn\'t exist', () => {
    const s = new SessionManager();
    const v = s.version;
    s.remove('a');
    expect(s.version).toBe(v);
  })

  test('update clash depth', () => {
    const s = new SessionManager();
    const p = {};
    p.clashDepth = 0;
    s.set('a', p);
    const v = s.version;
    s.setClashDepth('a', 2);
    expect(p.clashDepth).toBe(2);
    expect(s.version).toBe(v + 1);
  })

  test('can drag a session', () => {
    const s = new SessionManager();
    const callOrder = [];
    jest.spyOn(s, 'bumpStream').mockImplementation(() => callOrder.push('bumpStream'));
    jest.spyOn(s, 'bumpSession').mockImplementation(() => callOrder.push('bumpSession'));
    const p1 = { drag: jest.fn(), session: { stream: { sessions: [] } } };
    const p2 = { drag: jest.fn() };
    s.set('a', p1);
    s.set('b', p2);
    const v = s.version;
    s.drag('a');
    expect(p1.drag).toHaveBeenCalledTimes(1);
    expect(p2.drag).not.toHaveBeenCalled();
    expect(callOrder).toEqual(['bumpStream', 'bumpSession']);
    expect(s.version).toBe(v + 1);
  })

  test('dragging raises linked sessions', () => {
    const s = new SessionManager();
    jest.spyOn(s, 'bumpStream');
    jest.spyOn(s, 'bumpSession');
    const sessions = [
      { id: 'a-0' },
      { id: 'a-1' },
      { id: 'a-2' },
    ];
    const p1 = { drag: jest.fn(), raise: jest.fn(), session: { stream: { sessions } } };
    const p2 = { raise: jest.fn() };
    const p3 = { raise: jest.fn() };
    s.set('a-0', p1);
    s.set('a-1', p2);
    s.set('a-2', p3);
    const v = s.version;
    s.drag('a-0');
    expect(p1.raise).not.toHaveBeenCalled();
    expect(p2.raise).toHaveBeenCalledTimes(1);
    expect(p3.raise).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can move session with given delta', () => {
    const s = new SessionManager();
    const p = { move: jest.fn() };
    s.set('a', p);
    const v = s.version;
    const delta = { x: -10, y: 10 };
    s.move('a', delta);
    expect(p.move).toHaveBeenCalledTimes(1);
    expect(p.move).toHaveBeenCalledWith(delta);
    expect(s.version).toBe(v + 1);
  })

  test('can drop a session', () => {
    const s = new SessionManager();
    const p1 = { drop: jest.fn(), session: { stream: { sessions: [] } } };
    const p2 = { drop: jest.fn() };
    s.set('a', p1);
    s.set('b', p2);
    const v = s.version;
    s.drop('a');
    expect(p1.drop).toHaveBeenCalledTimes(1);
    expect(p2.drop).not.toHaveBeenCalled();
    expect(s.version).toBe(v + 1);
  })

  test('dropping lowers linked sessions', () => {
    const s = new SessionManager();
    const sessions = [
      { id: 'a-0' },
      { id: 'a-1' },
      { id: 'a-2' },
    ];
    const p1 = { drop: jest.fn(), lower: jest.fn(), session: { stream: { sessions } } };
    const p2 = { lower: jest.fn() };
    const p3 = { lower: jest.fn() };
    s.set('a-0', p1);
    s.set('a-1', p2);
    s.set('a-2', p3);
    const v = s.version;
    s.drop('a-0');
    expect(p1.lower).not.toHaveBeenCalled();
    expect(p2.lower).toHaveBeenCalledTimes(1);
    expect(p3.lower).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can raise a session', () => {
    const s = new SessionManager();
    const p = { raise: jest.fn() };
    s.set('a', p);
    const v = s.version;
    s.raise('a');
    expect(p.raise).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can lower a session', () => {
    const s = new SessionManager();
    const p = { lower: jest.fn() };
    s.set('a', p);
    const v = s.version;
    s.lower('a');
    expect(p.lower).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can touch a session', () => {
    const s = new SessionManager();
    const p = { touch: jest.fn() };
    s.set('a', p);
    const v = s.version;
    s.touch('a');
    expect(p.touch).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v);
  })

  test('can snap all sessions in a stream', () => {
    const s = new SessionManager();
    const sessions = [
      { id: 'a-0' },
      { id: 'a-1' },
      { id: 'a-2' },
    ];
    const p1 = { snap: jest.fn(), session: { stream: { sessions } } };
    const p2 = { snap: jest.fn() };
    const p3 = { snap: jest.fn() };
    s.set('a-0', p1);
    s.set('a-1', p2);
    s.set('a-2', p3);
    const v = s.version;
    s.snapStream('a-0');
    expect(p1.snap).toHaveBeenCalledTimes(1);
    expect(p2.snap).toHaveBeenCalledTimes(1);
    expect(p3.snap).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can snap one session', () => {
    const s = new SessionManager();
    const p = { snap: jest.fn() };
    s.set('a', p);
    const v = s.version;
    s.snap('a');
    expect(p.snap).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })

  test('can displace one session', () => {
    const s = new SessionManager();
    const p = { displace: jest.fn() };
    s.set('a', p);
    const v = s.version;
    s.displace('a');
    expect(p.displace).toHaveBeenCalledTimes(1);
    expect(s.version).toBe(v + 1);
  })
})


describe('bumping sessions and streams', () => {
  test('can bump a stream', () => {
    const s = new SessionManager();
    const sessions = [
      { id: 'a-0' },
      { id: 'a-1' },
      { id: 'a-2' },
    ];
    s.set('a-0', {});
    s.set('b-0', {});
    s.set('a-2', { session: { stream: { sessions } } });
    s.set('b-1', {});
    s.set('a-1', {});
    const v = s.version;
    s.bumpStream('a-2');
    expect(s.order).toEqual(['b-0', 'b-1', 'a-0', 'a-1', 'a-2']);
    expect(s.version).toBe(v + 1);
  })

  test('can bump a session from the start and change version', () => {
    const s = new SessionManager();
    s.set('a', {});
    s.set('b', {});
    s.set('c', {});
    const v = s.version;
    s.bumpSession('a');
    expect(s.order).toEqual(['b', 'c', 'a']);
    expect(s.version).toBe(v + 1);
  })

  test('can bump a session from the middle without mutating order', () => {
    const s = new SessionManager();
    s.set('a', {});
    s.set('b', {});
    s.set('c', {});
    const o = s.order;
    s.bumpSession('b');
    expect(s.order).not.toBe(o);
    expect(s.order).toEqual(['a', 'c', 'b']);
  })

  test('can bump a session from the end', () => {
    const s = new SessionManager();
    s.set('a', {});
    s.set('b', {});
    s.set('c', {});
    s.bumpSession('c');
    expect(s.order).toEqual(['a', 'b', 'c']);
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
    const placements = [{}, {}, {}]
    s1.set('a', placements[0]);
    s1.set('b', placements[1]);
    const v = s1.version;
    const s2 = new SessionManager(s1);
    s1.set('c', placements[2]);
    expect(s2._order).toEqual(['a', 'b']);
    expect(Array.from(s2.map.entries())).toEqual(
      [['a', placements[0]], ['b', placements[1]]]
    );
    expect(s2.version).toBe(v);
  })

  test('data gives expected values', () => {
    const s = new SessionManager();
    const placements = [{ data: {} }, { data: {} }, { data: {} }];
    s.set('a', placements[0]);
    s.set('b', placements[1]);
    const v = s.version;
    const data = s.data;
    s.set('c', placements[2]);
    expect(data.order).toEqual(['a', 'b']);
    expect(data.map).toEqual(
      [['a', placements[0].data], ['b', placements[1].data]]
    );
    expect(data.version).toBe(v);
  })

  // test('can convert back from data', () => {
  //   const s1 = new SessionManager();
  //   const stream = { times: [] };
  //   const course = { code: 'TEST1000', streams: [stream] };
  //   const placements = [
  //     { data: { abc: 'def', session: { course, stream } } },
  //     { data: { foo: 'bar', session: { course, stream } } },
  //   ];
  //   s1.set('a', placements[0]);
  //   s1.set('b', placements[1]);
  //   const s2 = SessionManager.from(s1.data, course);
  //   expect(s2.get('a')).toEqual(placements[0]);
  //   expect(s2.get('b')).toEqual(placements[1]);
  //   expect(s2.order).toEqual(s1.order);
  //   expect(s2.version).toBe(2);
  // })
})


describe('snapSessionTo', () => {
  const oldSessions = [
    { id: 'a-0' },
    { id: 'b-0' },
  ];
  const newSessions = [
    { id: 'c-0' },
    { id: 'd-0' },
  ];
  let s;
  const mockFactory = { create: jest.fn().mockReturnValue({ index: 0 }) };

  beforeEach(() => {
    s = new SessionManager();
    s.set('a-0', new SessionPlacement({ stream: { sessions: oldSessions }, }));
    s.set('b-0', new SessionPlacement({}));
  })

  test('increments version', () => {
    const v = s.version;
    s.snapSessionTo(
      'a-0',
      newSessions,
      mockFactory,
    );

    expect(s.version).toBe(v + 1);
  })

  test('replaces old sessions with new', () => {
    s.snapSessionTo(
      'a-0',
      newSessions,
    );

    expect(s.has('a-0')).toBe(false);
    expect(s.has('b-0')).toBe(false);
    expect(s.has('c-0')).toBe(true);
    expect(s.has('d-0')).toBe(true);
  })

  test('touches new sessions', () => {
    s.snapSessionTo(
      'a-0',
      newSessions,
    );

    expect(s.get('c-0').touched).toBe(true);
    expect(s.get('d-0').touched).toBe(true);
  })

  test('touches sessions if unchanged', () => {
    s.snapSessionTo(
      'a-0',
      oldSessions,
    );

    expect(s.get('a-0').touched).toBe(false);
    expect(s.get('b-0').touched).toBe(false);
  })

  test('new sessions are snapped', () => {
    const c = new SessionPlacement({});
    const d = new SessionPlacement({});
    c._offset = { x: 10, y: 10 };
    d._offset = { x: 20, y: 0 };
    s.set('c-0', c);
    s.set('d-0', d);

    s.snapSessionTo(
      'a-0',
      newSessions,
    );

    expect(s.get('c-0')._offset).toEqual({ x: 0, y: 0 });
    expect(s.get('d-0')._offset).toEqual({ x: 0, y: 0 });
  })
})


describe('update', () => {

})

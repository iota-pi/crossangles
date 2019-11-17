import { SessionManager } from './SessionManager';
import { SessionPlacement as RealSessionPlacement } from './SessionPlacement';

jest.mock('./SessionPlacement');
const MockSessionPlacement = RealSessionPlacement as jest.Mock<RealSessionPlacement>;

describe('SessionManager', () => {
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
    const p = new MockSessionPlacement();
    s.set('a', p);

    expect(s.get('a')).toBe(p);
  })

  test('getMaybe returns found placement', () => {
    const s = new SessionManager();
    const p = new MockSessionPlacement();
    s.set('a', p);

    expect(s.getMaybe('a')).toBe(p);
  })

  test('has returns true when found', () => {
    const s = new SessionManager();
    s.set('a', new MockSessionPlacement());

    expect(s.has('a')).toBe(true);
  })

  test('has returns false when not found', () => {
    const s = new SessionManager();

    expect(s.has('a')).toBe(false);
  })

  test('set advances version', () => {
    const s = new SessionManager();
    expect(s.version).toBe(0);
    s.set('a', new MockSessionPlacement());
    expect(s.version).toBe(1);
  })

  test('set adds items in expected order', () => {
    const s = new SessionManager();
    s.set('o', new MockSessionPlacement());
    s.set('r', new MockSessionPlacement());
    s.set('d', new MockSessionPlacement());

    expect(s.order).toEqual(['o', 'r', 'd']);
  })

  test('order is not mutated by set', () => {
    const s = new SessionManager();
    s.set('a', new MockSessionPlacement());
    const initialOrder = s.order;
    s.set('b', new MockSessionPlacement());
    expect(s.order).not.toBe(initialOrder);
  })

  test('order is not mutated by remove', () => {
    const s = new SessionManager();
    s.set('a', new MockSessionPlacement());
    const initialOrder = s.order;
    s.remove('a');
    expect(s.order).not.toBe(initialOrder);
  })

  test('getOrder returns expected values', () => {
    const s = new SessionManager();
    s.set('o', new MockSessionPlacement());
    s.set('r', new MockSessionPlacement());
    s.set('d', new MockSessionPlacement());

    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('r')).toBe(1);
    expect(s.getOrder('d')).toBe(2);
    expect(s.getOrder('-')).toBe(-1);
  })

  test('remove removes from order', () => {
    const s = new SessionManager();
    s.set('o', new MockSessionPlacement());
    s.set('r', new MockSessionPlacement());
    s.set('d', new MockSessionPlacement());
    s.remove('r');

    expect(s.getOrder('o')).toBe(0);
    expect(s.getOrder('d')).toBe(1);
    expect(s.getOrder('r')).toBe(-1);
    expect(s.order).toEqual(['o', 'd']);
  })
})

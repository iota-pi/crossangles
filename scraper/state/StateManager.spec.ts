import StateManager from './StateManager';
import getStateManager from './getStateManager';
import { DynamoDB } from 'aws-sdk';

describe('StateManager', () => {
  it('get returns the right value', async () => {
    const mockClient = {
      get: jest.fn(() => ({
        promise: async () => ({ Item: { key: 'a', value: 'value' } }),
      })),
    };
    const sm = new StateManager(mockClient as any);
    expect(await sm.get('abc', 'a')).toBe('value');
    expect(mockClient.get).toHaveBeenCalled();
  })

  it('get returns undefined if it cannot fetch', async () => {
    const mockClient = {
      get: jest.fn(() => ({
        promise: async () => { throw new Error(); },
      })),
    };
    const sm = new StateManager(mockClient as any);
    expect(await sm.get('abc', 'a')).toBe(undefined);
    expect(await sm.get('abc', 'b')).toBe(undefined);
    expect(mockClient.get).toHaveBeenCalledTimes(2);
  })

  it('set raises any errors', async () => {
    const mockClient = {
      put: jest.fn(() => ({ promise: async () => { throw new Error(); } })),
    };
    const sm = new StateManager(mockClient as any);
    await expect(sm.set('abc', 'a', 'some value')).rejects.toThrow();
  })

  it('delete raises any errors', async () => {
    const mockClient = {
      update: jest.fn(() => ({ promise: async () => { throw new Error(); } })),
    };
    const sm = new StateManager(mockClient as any);
    await expect(sm.delete('abc', 'a')).rejects.toThrow();
  })
})

describe('StateManager integration', () => {
  it.each`
    value ${0} ${1} ${99} ${'1'} ${'palantiri!'}
  `('can round-trip values ($value)', async ({ value }) => {
    const sm = await getStateManager();
    await sm.set('unsw', 'count', value);
    expect(await sm.get('unsw', 'count')).toBe(value);
  })

  it('can delete items', async () => {
    const sm = await getStateManager();
    await sm.set('unsw', 'blah', 1);
    await sm.delete('unsw', 'blah');
    expect(await sm.get('unsw', 'blah')).toBe(undefined);
  })

  it('copes with multiple drops and inits', async () => {
    const ddb = new DynamoDB({
      endpoint: 'http://localhost:8000',
      region: 'ap-southeast-2',
    });
    const sm = await getStateManager();
    await sm.drop(ddb);
    await sm.drop(ddb);
    await sm.init(ddb);
    await sm.init(ddb);
  })
})

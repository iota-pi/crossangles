import { scrapeUNSW } from './index';
import { Scraper } from '../Scraper';
import StateManager from '../../state/StateManager';

describe('scrapeUNSW', () => {
  const cacheFile = 'unsw-snapshot.json.br';
  const scraper = new Scraper();
  const cache = scraper.cache;
  const cachePromise = cache.load(cacheFile).catch(() => {});
  const state: StateManager = { get: jest.fn(), set: jest.fn(), getBlob: jest.fn(), setBlob: jest.fn() } as any;

  it('gives consistent output', async () => {
    await cachePromise;
    const result = await scrapeUNSW({ scraper, state, forceUpdate: true });
    expect(result).not.toBeNull();
    expect(result![0].courses).toMatchSnapshot();
    await cache.write(cacheFile);
  })
})

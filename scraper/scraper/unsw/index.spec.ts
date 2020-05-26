import { scrapeUNSW } from './index';
import { Scraper } from '../Scraper';
import StateManager from '../../state/StateManager';

jest.setTimeout(10000);

describe('scrapeUNSW', () => {
  it('gives consistent output', async () => {
    const cacheFile = 'unsw-snapshot.json.br';
    const scraper = new Scraper();
    const cache = scraper.cache;
    await cache.load(cacheFile).catch(() => {});
    const state: StateManager = { get: jest.fn(), set: jest.fn() } as any;
    const result = await scrapeUNSW({ state });
    expect(result[0].courses).toMatchSnapshot();
    await cache.write(cacheFile);
  })
})

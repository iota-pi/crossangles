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
    const courses = result![0].courses;
    for (let i = 0; i < courses.length; ++i) {
      if (courses[i].isAdditional) {
        courses[i] = {
          ...courses[i],
          metadata: undefined,
          streams: [],
          description: undefined,
          defaultColour: undefined,
        };
      }
    }
    expect(courses.filter(c => c.isAdditional)).toMatchSnapshot();
    await cache.write(cacheFile);
  })
})

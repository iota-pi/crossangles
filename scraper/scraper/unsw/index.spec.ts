import { scrapeUNSW, filterEnrolmentStreams } from './index';
import { Scraper } from '../Scraper';
import { StateManager } from '../../state/StateManager';
import { StreamData, ClassTime } from '../../../app/src/state/Stream';

describe('scrapeUNSW', () => {
  const cacheFile = 'unsw-snapshot.json.br';
  const scraper = new Scraper();
  const cache = scraper.cache;
  const cachePromise = cache.load(cacheFile).catch(() => {});
  const state: StateManager = {
    get: jest.fn(), set: jest.fn(), getBlob: jest.fn(), setBlob: jest.fn(),
  } as any;

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
    expect(courses).toMatchSnapshot();
    await cache.write(cacheFile);
  });
});

it('filterEnrolmentStreams', () => {
  const enrols: [number, number] = [0, 0];
  const times: ClassTime[] = [];
  const streams: StreamData[] = [
    { component: 'LEC', enrols, times },
    { component: 'CRS', enrols, times },
    { component: 'CR01', enrols, times },
    { component: 'CR02', enrols, times },
    { component: 'CR99', enrols, times },
    { component: 'CR100', enrols, times },
    { component: 'OTH', enrols, times },
  ];
  const result = filterEnrolmentStreams(streams);
  expect(result.map(s => s.component)).toEqual(['CRS', 'CR01', 'CR02', 'CR99']);
});

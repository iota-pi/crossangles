import { filterEnrolmentStreams } from './scrapeUNSW';
import { StreamData, ClassTime } from '../../../app/src/state/Stream';

it('filterEnrolmentStreams', () => {
  const times: ClassTime[] = [];
  const streams: StreamData[] = [
    { component: 'LEC', times },
    { component: 'CRS', times },
    { component: 'CR01', times },
    { component: 'CR02', times },
    { component: 'CR99', times },
    { component: 'CR100', times },
    { component: 'OTH', times },
  ];
  const result = filterEnrolmentStreams(streams);
  expect(result.map(s => s.component)).toEqual(['CRS', 'CR01', 'CR02', 'CR99']);
});

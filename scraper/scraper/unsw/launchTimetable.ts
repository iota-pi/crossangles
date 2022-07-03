import { writeFileSync } from 'fs';
import { TimetableScraper } from './TimetableScraper';

const runScraper = async () => {
  const timetable = new TimetableScraper();
  timetable.state = undefined;
  timetable.facultyLinkFilter = links => links.filter(l => l.includes('MATH'));
  await timetable.setup();
  const result = await timetable.scrape();
  writeFileSync('test_timetable.json', JSON.stringify(result, undefined, 2));
};

runScraper();

import { TimetableScraper } from './TimetableScraper';
import { writeFileSync } from 'fs';

const test = async () => {
  const timetable = new TimetableScraper();
  timetable.state = undefined;
  timetable.facultyLinkFilter = links => links.filter(l => l.includes('DESN'));
  await timetable.setup();
  const result = await timetable.scrape();
  writeFileSync('test_timetable.json', JSON.stringify(result[2]));
}
test();

import { TimetableScraper } from './TimetableScraper';
import { writeFileSync } from 'fs';

const test = async () => {
  const timetable = new TimetableScraper();
  timetable.state = undefined;
  await timetable.setup();
  const result = await timetable.scrape();
  writeFileSync('test_timetable.json', JSON.stringify(result[2]));
}
test();

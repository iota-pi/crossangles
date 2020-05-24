import { TimetableScraper } from './TimetableScraper';
import { writeFileSync } from 'fs';

const test = async () => {
  const timetable = new TimetableScraper();
  timetable.maxFaculties = 1;
  await timetable.setup();
  const result = await timetable.scrape();
  writeFileSync('timetable.json', JSON.stringify(result[0][0]));
}
test();

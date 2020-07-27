import { writeFileSync } from 'fs';
import ClassUtilScraper from './ClassUtilScraper';

const test = async () => {
  const timetable = new ClassUtilScraper();
  timetable.state = undefined;
  await timetable.setup();
  const result = await timetable.scrape(3);
  writeFileSync('test_classutil.json', JSON.stringify(result));
}
test();

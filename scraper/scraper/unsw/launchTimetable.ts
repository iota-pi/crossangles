import { TimetableScraper } from './TimetableScraper';
import { writeFileSync } from 'fs';

const test = async () => {
  const timetable = new TimetableScraper();
  timetable.state = undefined;
  await timetable.setup();
  const result = await timetable.scrape();
  console.log(result[2][0].streams);
  writeFileSync('timetable.json', JSON.stringify(result[0][0]));
}
test();

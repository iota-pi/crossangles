// import { writeFileSync } from 'fs';
import UOSTimetableScraper from './UOSTimetableScraper';

const runScraper = async () => {
  const year = await UOSTimetableScraper.getLatestYear();
  console.log('Latest year is', year);
  const timetable = new UOSTimetableScraper({ year });
  timetable.state = undefined;
  await timetable.setup();
  const result = await timetable.scrape();
  // writeFileSync('test_timetable.json', JSON.stringify(result[2]));
};
runScraper();

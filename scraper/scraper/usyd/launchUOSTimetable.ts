import UOSTimetableScraper from './UOSTimetableScraper';

const runScraper = async () => {
  const year = await UOSTimetableScraper.getLatestYear();
  const timetable = new UOSTimetableScraper({ year });
  timetable.state = undefined;
  await timetable.setup();
  await timetable.scrape();
};
runScraper();

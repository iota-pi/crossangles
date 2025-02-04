// Use "npx tsx launchTimetable.ts" to run the scraper locally

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { TimetableScraper } from './TimetableScraper';
import { splitByTerm } from './scrapeUNSW';

const runScraper = async ({
  useFilters = false,
  saveToFile = true,
  prettyPrint = true,
}: {
  useFilters?: boolean,
  saveToFile?: boolean,
  prettyPrint?: boolean,
} = {}) => {
  const timetable = new TimetableScraper();
  timetable.state = undefined;
  if (useFilters) {
    timetable.facultyLinkFilter = links => links.filter(l => l.includes('MATH'));
  }
  await timetable.setup();
  const result = await timetable.scrape();

  if (saveToFile) {
    const basePath = '../../../app/public'
    let path = `${basePath}/unsw/data.json`;
    if (!existsSync(basePath)) {
      console.warn('Could not find app/public/ directory, writing to working directory');
      path = 'data.json';
    } else {
      const dir = path.slice(0, path.lastIndexOf('/'))
      if (!existsSync(dir)) {
        mkdirSync(dir);
      }
    }

    const resultsByTerm = splitByTerm(result);
    let current = resultsByTerm.find(t => t.current);
    writeFileSync(
      path,
      JSON.stringify(current, undefined, prettyPrint ? 2 : undefined),
    );
  }
};

runScraper();

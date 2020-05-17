import scrapeCampus from './scrapeCampus';
import { CampusData } from './scraper/Scraper';
import ClassUtilScraper from './scraper/unsw/ClassUtilScraper';
import { getWriter } from './writer';
import Writer from './writer/Writer';
import FileWriter from './writer/FileWriter';
import { generateMetaData } from './scraper/meta';

// jest.mock('./writer');
// const mock_getWriter = <jest.Mock<Writer>>getWriter;

it('passes', () => {});

// describe('scrapeCampus', () => {
//   it('only writes out once if it finds no data', async () => {
//     const scraper = await ClassUtilScraper.create();
//     scraper.logging = false;

//     const scrapeResult: CampusData = {
//       campus: 'unsw',
//       courses: [],
//       meta: generateMetaData(1, 'http://classutil.unsw.edu.au'),
//       current: false,
//     };
//     scraper.setup = jest.fn().mockImplementation(async () => undefined);
//     scraper.scrape = jest.fn().mockImplementation(async () => [scrapeResult]);

//     const writer = new FileWriter('abc.json');
//     writer.write = jest.fn().mockImplementation(async () => {});
//     mock_getWriter.mockImplementation(() => writer);

//     await scrapeCampus('unsw');

//     expect(writer.write).toBeCalledTimes(1);
//     expect(writer.write).toBeCalledWith(scrapeResult);
//   })

//   it('only writes out twice for current data', async () => {
//     const scraper = await ClassUtilScraper.create();
//     scraper.logging = false;

//     const scrapeResult: CampusData = {
//       campus: 'unsw',
//       courses: [],
//       meta: scraper.generateMetaData(1, 'http://classutil.unsw.edu.au'),
//       current: true,
//     };
//     scraper.setup = jest.fn().mockImplementation(async () => undefined);
//     scraper.scrape = jest.fn().mockImplementation(async () => [scrapeResult]);
//     mock_getCampusScraper.mockImplementation(async () => scraper);

//     const writer = new FileWriter('abc.json');
//     writer.write = jest.fn().mockImplementation(async () => {});
//     mock_getWriter.mockImplementation(() => writer);

//     await scrapeCampus('unsw');

//     expect(writer.write).toBeCalledTimes(2);
//     expect(writer.write).toBeCalledWith(scrapeResult);
//   })
// })

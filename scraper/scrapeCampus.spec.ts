import scrapeCampus from './scrapeCampus';
import { getCampusScraper } from './scraper';
import { CampusScraper, CampusData } from './scraper/CampusScraper';
import ClassUtilScraper from './scraper/UNSW/ClassUtilScraper';
import { getWriter } from './writer';
import Writer from './writer/Writer';
import FileWriter from './writer/FileWriter';

jest.mock('./scraper');
const mock_getCampusScraper = <jest.Mock<Promise<CampusScraper>>>getCampusScraper;
jest.mock('./writer');
const mock_getWriter = <jest.Mock<Writer>>getWriter;

describe('scrapeCampus', () => {
  it('only writes out once if it finds no data', async () => {
    const scraper = await ClassUtilScraper.create();
    scraper.logging = false;

    const scrapeResult: CampusData = {
      campus: 'unsw',
      courses: [],
      meta: scraper.generateMetaData(1, 'http://classutil.unsw.edu.au'),
      current: false,
    };
    scraper.scrape = jest.fn().mockImplementation(async () => [scrapeResult]);
    mock_getCampusScraper.mockImplementation(async () => scraper);

    const writer = new FileWriter('abc.json');
    writer.write = jest.fn().mockImplementation(async () => {});
    mock_getWriter.mockImplementation(() => writer);

    await scrapeCampus('unsw');

    expect(writer.write).toBeCalledTimes(1);
    expect(writer.write).toBeCalledWith(scrapeResult);
  })

  it('only writes out twice for current data', async () => {
    const scraper = await ClassUtilScraper.create();
    scraper.logging = false;

    const scrapeResult: CampusData = {
      campus: 'unsw',
      courses: [],
      meta: scraper.generateMetaData(1, 'http://classutil.unsw.edu.au'),
      current: true,
    };
    scraper.scrape = jest.fn().mockImplementation(async () => [scrapeResult]);
    mock_getCampusScraper.mockImplementation(async () => scraper);

    const writer = new FileWriter('abc.json');
    writer.write = jest.fn().mockImplementation(async () => {});
    mock_getWriter.mockImplementation(() => writer);

    await scrapeCampus('unsw');

    expect(writer.write).toBeCalledTimes(2);
    expect(writer.write).toBeCalledWith(scrapeResult);
  })
})

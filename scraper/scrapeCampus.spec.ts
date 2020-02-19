import scrapeCampus from './scrapeCampus';
import { getCampusScraper } from './scraper';
import { CampusScraper, CampusData } from './scraper/CampusScraper';
import UNSWScraper from './scraper/UNSWScraper';
import { getWriter } from './writer';
import Writer from './writer/Writer';
import FileWriter from './writer/FileWriter';

jest.mock('./scraper');
const mock_getCampusScraper = <jest.Mock<CampusScraper>>getCampusScraper;
jest.mock('./writer');
const mock_getWriter = <jest.Mock<Writer>>getWriter;

describe('scrapeCampus', () => {
  it('only writes out if it finds data', async () => {
    const scraper = new UNSWScraper();
    scraper.logging = false;

    const scrapeResult: CampusData = { courses: [], meta: scraper.generateMetaData(1) };
    scraper.scrape = jest.fn().mockImplementation(async () => scrapeResult);
    mock_getCampusScraper.mockImplementation(() => scraper);

    const writer = new FileWriter('abc.json');
    writer.write = jest.fn().mockImplementation(async () => {});
    mock_getWriter.mockImplementation(() => writer);

    await scrapeCampus('unsw');

    expect(writer.write).toBeCalledTimes(1);
    expect(writer.write).toBeCalledWith(scrapeResult);
  })
})

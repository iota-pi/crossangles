process.env.APIFY_LOCAL_STORAGE_DIR = './apify_storage';
process.env.APIFY_LOG_LEVEL = 'WARNING';

import * as Apify from 'apify';
import { writeFileSync } from 'fs';
import { CourseData } from '../state/Course';
import { Meta } from '../state/Meta';
import { parseCourse, parseStream, removeDuplicateStreams } from './parsing';
import { getCampusData, Campus } from './campus';

const campus = (process.env.REACT_APP_CAMPUS || 'unsw') as Campus;
const campus_data = getCampusData(campus);


const crawl = async (term: number) => {
  const findFacultyPages = async () => {
    const links: string[] = [];
    const linkRegex = new RegExp(`[A-Y][A-Z]{3}_[ST]${term}.html$`);
    await crawlPages([campus_data.source], async ({ $ }) => {
      const matchingLinks = $('a').filter((i: number, e: any) => linkRegex.test($(e).attr('href')));
      links.push(...matchingLinks.map((i: number, e: any): string => $(e).attr('href')));
    });
    return links
  }

  const crawlFacultyPages = async (pages: string[]) => {
    const courses: CourseData[] = [];
    const urls = pages.map(page => `${campus_data.source}/${page}`);
    await crawlPages(urls, async ({ $ }) => {
      // Get all rows of the table (except for the first which is the header)
      const rows = $($('table').get(2)).find('tr').slice(1);
      rows.map((i: any, e: any) => {
        const cells = $(e).find('td');

        if (cells.length === 1) {
          // One cell in a row is the end of the table
          return false;
        } else if (cells.length === 2) {
          // Two cells in a row is the start of a course
          const course = parseCourse(
            $(cells.get(0)).text(),
            $(cells.get(1)).text(),
          );
          courses.push(course);
        } else if (cells.length === 8) {
          // Eight cells in a row is a stream of the most recent course
          const course = courses[courses.length - 1];
          const stream = parseStream(
            $(cells.get(0)).text(),
            $(cells.get(1)).text(),
            $(cells.get(4)).text(),
            $(cells.get(5)).text(),
            $(cells.get(7)).text(),
          );
          if (stream !== null) {
            course.streams.push(stream);
          }
        }
      })
    });

    // Remove duplicate streams from each course
    for (let course of courses) {
      removeDuplicateStreams(course);
    }

    // Add additional events (campus-specific) data
    courses.push(...campus_data.data);

    // Sort courses for consistency
    courses.sort((a, b) => a.code.localeCompare(b.code));

    return courses;
  }

  const generateMetaData = () => {
    const zfill = (x: string | number, n = 2) => x.toString().padStart(n, '0');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    return {
      term,
      signup: process.env.SIGN_UP,
      year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
      updateDate: `${zfill(currentDay)}/${zfill(currentMonth + 1)}/${currentYear}`,
      updateTime: `${zfill(now.getHours())}:${zfill(now.getMinutes())}`,
      ...campus_data.meta,
    } as Meta;
  }

  const facultyPages = await findFacultyPages();
  const courses = await crawlFacultyPages(facultyPages);
  const meta = generateMetaData();
  const data = JSON.stringify({ courses, meta });

  writeFileSync(campus_data.output, data, 'utf-8');
}

const crawlPages = async (urls: string[], handler: (result: any) => any) => {
  const requestList = new Apify.RequestList({
    sources: urls.map(url => ({ url })),
  });
  await requestList.initialize();

  const crawler = new Apify.CheerioCrawler({
    requestList,
    handlePageFunction: handler,
  });
  await crawler.run();
}

// TODO crawl multiple terms (in reverse order) to find most recent term with enough data

crawl(2).then(() => {
  console.log('done!!');
}).catch((e) => {
  console.log(e);
})

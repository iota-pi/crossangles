process.env.APIFY_LOCAL_STORAGE_DIR = './apify_storage';
process.env.APIFY_LOG_LEVEL = 'WARNING';

import * as Apify from 'apify';
import Course, { CourseData } from '../state/Course';
import { Meta, Stream } from '../state';
import { writeFileSync } from 'fs';

const CBS_DATA: CourseData = require('../../src/assets/cbs.json');
const OUTPUT_DATA_FILE = './public/data.json';
const CLASSUTIL_BASE = 'http://classutil.unsw.edu.au';


const crawl = async (term: number) => {
  const findFacultyPages = async () => {
    const links: string[] = [];
    const linkRegex = new RegExp(`[A-Y][A-Z]{3}_[ST]${term}.html$`);
    await crawlPages([CLASSUTIL_BASE], async ({ $ }) => {
      const matchingLinks = $('a').filter((i: number, e: any) => linkRegex.test($(e).attr('href')));
      links.push(...matchingLinks.map((i: number, e: any): string => $(e).attr('href')));
    });
    return links
  }

  const crawlFacultyPages = async (pages: string[]) => {
    const courses: Course[] = [];
    const urls = pages.map(page => `${CLASSUTIL_BASE}/${page}`);
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
          courses.push(Course.from({
            code: $(cells.get(0)).text(),
            name: $(cells.get(1)).text(),
          }));
        } else if (cells.length === 8) {
          // Eight cells in a row is a stream of the most recent course
          courses[courses.length - 1].addStream({
            component: $(cells.get(0)).text(),
            section: $(cells.get(1)).text(),
            status: $(cells.get(4)).text(),
            enrols: $(cells.get(5)).text(),
            times: $(cells.get(7)).text(),
          });
        }
      })
    });

    // Remove duplicate streams from each course
    for (let course of courses) {
      course.removeDuplicates();
    }

    // Add CBS "course" data
    courses.push(new Course(CBS_DATA));

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
    } as Meta
  }

  const facultyPages = await findFacultyPages();
  const courses = await crawlFacultyPages(facultyPages);
  const meta = generateMetaData();
  const data = JSON.stringify({ courses, meta });

  writeFileSync(OUTPUT_DATA_FILE, data, 'utf-8');
}

const crawlPages = async (urls: string[], handler: (result: any) => any) => {
  const requestList = new Apify.RequestList({
    sources: urls.map(url => ({ url })),
  });
  await requestList.initialize();

  const crawler = new Apify.CheerioCrawler({
    requestList,
    handlePageFunction: handler
  });
  await crawler.run();
}

// TODO crawl multiple terms (in reverse order) to find most recent term with enough data

crawl(2).then(() => {
  console.log('done!!');
}).catch((e) => {
  console.log(e);
})

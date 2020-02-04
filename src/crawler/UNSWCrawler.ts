import { CampusCrawler } from './CampusCrawler';
import { CourseData, courseSort } from '../state/Course';
import { parseCourse, parseStream, removeDuplicateStreams } from './parsing';

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;
const MAX_FACULTIES = Infinity;

export class UNSWCrawler extends CampusCrawler {
  readonly additional = require(process.env.UNSW_ADDITIONAL_DATA_FILE!);
  readonly meta = require(process.env.UNSW_INFO_FILE!);
  readonly source = process.env.UNSW_DATA_SOURCE!;
  readonly output = process.env.UNSW_OUTPUT_FILE!;
  readonly name = 'UNSW';

  async crawl () {
    const term = 2;
    this.log(`crawling term ${term} from ${this.source}`);
    const facultyPages = await this.findFacultyPages(term);
    const courses = await this.crawlFacultyPages(facultyPages);
    const meta = this.generateMetaData(term);
    return { courses, meta };
  }

  private async findFacultyPages (term: number) {
    const links: string[] = [];
    const linkRegex = new RegExp(`[A-Y][A-Z]{3}_[ST]${term}.html$`);
    await this.crawlPages([this.source], async ({ $ }) => {
      const matchingLinks = $('a').filter((i: number, e: any) => linkRegex.test($(e).attr('href')));
      links.push(...matchingLinks.map((i: number, e: any): string => $(e).attr('href')));
    });

    links.length = Math.min(links.length, MAX_FACULTIES);

    this.log(`found ${links.length} faculy pages`);
    return links;
  }

  private async crawlFacultyPages (pages: string[]) {
    const courses: CourseData[] = [];
    const urls = pages.map(page => `${this.source}/${page}`);
    await this.crawlPages(urls, async ({ $ }) => {
      // Get all rows of the table (except for the first which is the header)
      const rows = $($('table').get(2)).find('tr').slice(1);
      rows.map((i: any, e: any) => {
        const cells = $(e).find('td');

        if (cells.length === TABLE_END_COUNT) {
          return false;
        } else if (cells.length === COURSE_HEADING_COUNT) {
          const course = parseCourse(
            $(cells.get(0)).text(),
            $(cells.get(1)).text(),
          );
          courses.push(course);
        } else if (cells.length === REGULAR_CELL_COUNT) {
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

    // Add (campus-specific) additional events
    courses.push(...this.additional);

    // Sort courses for consistency
    courses.sort(courseSort);

    this.log(`parsed ${courses.length} courses`);
    return courses;
  }
}

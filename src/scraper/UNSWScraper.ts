import { CampusScraper } from './CampusScraper';
import { CourseData } from '../state/Course';
import { ClassTime, StreamData } from '../state/Stream';
import additional from './data/additional';
import info from './data/info';

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;

export class UNSWScraper extends CampusScraper {
  protected readonly additional = additional.unsw;
  protected readonly meta = info.unsw;
  readonly source = process.env.UNSW_DATA_SOURCE!;
  readonly output = process.env.UNSW_OUTPUT_FILE!;
  readonly name = 'UNSW';
  readonly parser: Parser;
  maxFaculties = Infinity;

  constructor (parser?: Parser, maxFaculties?: number) {
    super();
    this.parser = parser || new Parser();
    this.maxFaculties = maxFaculties || this.maxFaculties;
  }

  async scrape () {
    const term = 2;
    this.log(`scraping term ${term} from ${this.source}`);
    const facultyPages = await this.findFacultyPages(term);
    const courses = await this.scrapeFacultyPages(facultyPages);
    const meta = this.generateMetaData(term);
    return { courses, meta };
  }

  private async findFacultyPages (term: number) {
    const links: string[] = [];
    const linkRegex = new RegExp(`[A-Y][A-Z]{3}_[ST]${term}.html$`);
    await this.scrapePages([this.source], async ({ $ }) => {
      const allLinks: string[] = $('a').map((i: number, e: any) => $(e).attr('href')).toArray();
      const matchingLinks = allLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);
    });

    links.length = Math.min(links.length, this.maxFaculties);

    this.log(`found ${links.length} faculy pages`);
    return links;
  }

  private async scrapeFacultyPages (pages: string[]) {
    const courses: CourseData[] = [];
    const urls = pages.map(page => `${this.source}/${page}`);
    await this.scrapePages(urls, async ({ $ }) => {
      // Get all rows of the table (except for the first which is the header)
      const rows = $($('table').get(2)).find('tr').slice(1);
      rows.map((i: any, e: any) => {
        const cells = $(e).find('td');

        if (cells.length === TABLE_END_COUNT) {
          return false;
        } else if (cells.length === COURSE_HEADING_COUNT) {
          const course = this.parser.parseCourse(
            $(cells.get(0)).text(),
            $(cells.get(1)).text(),
          );
          courses.push(course);
        } else if (cells.length === REGULAR_CELL_COUNT) {
          const course = courses[courses.length - 1];
          const stream = this.parser.parseStream(
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

export default UNSWScraper;


export class Parser {
  courseNames: { [code: string]: string } = require('./courses-unsw.json');

  parseCourse (rawCode: string, rawName: string): CourseData {
    const code = rawCode.trim();
    rawName = rawName.trim();
    const term = (/ \(([A-Z][A-Z0-9]{2})\)$/.exec(rawName) || [])[1];
    const fullName = this.courseNames[code];
    const termRegex = new RegExp(`\\s*\\(${term}\\)$`);
    const name = fullName || rawName.replace(termRegex, '');
    return {
      code,
      name,
      streams: [],
      term,
    };
  }

  parseStream (
    component: string,
    section: string,
    status: string,
    enrolString: string,
    timeString: string,
  ): StreamData | null {
    if (component === 'CRS') {
      return null;
    }

    status = status.trim().replace(/\*$/, '').toLowerCase();
    if (status !== 'open' && status !== 'full') {
      return null;
    }
    const full = status === 'full';

    const enrols = enrolString.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
    if (enrols[1] === 0) {
      return null;
    }

    let web = false;
    let times: ClassTime[] | null = null;
    if (section.indexOf('WEB') === -1) {
      times = this.parseTimeStr(timeString);

      if (times === null || times.length === 0) {
        return null;
      }
    } else {
      web = true;

      // Standardise all web streams as 'LEC' component
      component = 'LEC';
    }

    return {
      component,
      enrols,
      full,
      times,
      web,
    };
  }

  private parseTimeStr (timeString: string): ClassTime[] | null {
    // Basic string sanitisation
    timeString = timeString.replace(/\/odd|\/even|Comb\/w.*/g, '').trim();

    // Return empty list if no data has been given
    if (timeString === '') {
      return [];
    }

    if (timeString.indexOf('; ') !== -1) {
      const timeParts = timeString.split('; ');
      const times = timeParts.reduce((a: ClassTime[], t) => a.concat(this._parseDataStr(t)), []);

      // Remove any duplicate times
      const timeSet = new Set();
      const finalTimes: ClassTime[] = [];
      for (let time of times) {
        if (!timeSet.has(time.time)) {
          timeSet.add(time.time);
          finalTimes.push(time);
        }
      }

      return finalTimes;
    } else {
      return this._parseDataStr(timeString);
    }
  }

  private _parseDataStr (data: string): ClassTime[] {
    const openBracketIndex = data.indexOf('(');
    if (openBracketIndex !== -1) {
      const tidiedTime = this.tidyUpTime(data.slice(0, openBracketIndex).trim());
      if (tidiedTime === null) {
        return [];
      }
      const [time, canClash] = tidiedTime;

      const otherDetails = data.slice(openBracketIndex + 1, data.indexOf(')'));
      const weeks = this.getWeeks(otherDetails);
      if (weeks === null) {
        return [];
      }

      const commaIndex = otherDetails.indexOf(', ')
      let location = '';
      if (commaIndex !== -1) {
        location = otherDetails.slice(commaIndex + 2);
      } else if (otherDetails.length > 0 && otherDetails[0] !== 'w') {
        location = otherDetails;
      }

      location = location.toLowerCase() !== 'see school' ? location : '';

      return [{
        time,
        weeks: weeks || undefined,
        location: location || undefined,
        canClash,
      }];
    } else {
      const tidiedTime = this.tidyUpTime(data);
      if (tidiedTime !== null) {
        const [ time, canClash ] = tidiedTime;
        return [{ time, canClash }];
      } else {
        return [];
      }
    }
  }

  private tidyUpTime (time: string): [string, boolean | undefined] | null {
    if (time === '' || time === '00-00') {
      return null;
    }

    const days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's'};
    for (let [day, letter] of Object.entries(days)) {
      time = time.replace(day + ' ', letter);
    }

    // Use decimal notation for half-hours
    time = time.replace(':30', '.5')

    // Remove leading zeros
    time = time.replace(/(?<=[MTWHFSs])0(?=[0-9])/, '');

    // Don't include courses which run over multiple days (usually intensives) or on weekends
    if (isNaN(+time[1]) || time.toLocaleLowerCase().indexOf('s') !== -1) {
      return null;
    }

    const canClash = time.endsWith('#') ? true : undefined;
    time = time.replace(/#$/, '');

    return [time, canClash];
  }

  private getWeeks (weeks: string) {
    weeks = weeks.split(', ')[0].replace(/^[, ]|[, ]$/g, '');

    if (weeks === '' || weeks[0] !== 'w') {
      return '';
    }

    weeks = weeks.replace(/^w/, '');

    // Don't include classes which only run outside of regular term weeks
    if (/^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks)) {
      return null;
    }

    return weeks;
  }
}

export function removeDuplicateStreams (course: CourseData) {
  const mapping = new Map<string, StreamData[]>();
  for (let stream of course.streams) {
    const times = stream.times !== null ? stream.times.map(t => t.time) : null;
    const key = stream.component + `[${times}]`;
    const currentGroup = mapping.get(key) || [];
    const newGroup = currentGroup.concat(stream);
    mapping.set(key, newGroup);
  }

  // For each set of streams with identical component and times, remove all but the emptiest stream
  for (const streamGroup of Array.from(mapping.values())) {
    const emptiest = emptiestStream(streamGroup);
    for (let stream of streamGroup) {
      if (stream !== emptiest) {
        const index = course.streams.indexOf(stream)
        course.streams.splice(index, 1);
      }
    }
  }
}

function emptiestStream (streams: StreamData[]) {
  let bestStream = null;
  let bestRatio = Infinity;
  for (let stream of streams) {
    const ratio = stream.enrols[0] / stream.enrols[1];
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestStream = stream;
    }
  }

  return bestStream!;
}

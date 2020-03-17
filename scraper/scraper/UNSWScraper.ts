import { CampusScraper, CampusData } from './CampusScraper';
import StateManager from '../state/StateManager';
import { CourseData } from '../../app/src/state/Course';
import { ClassTime, StreamData } from '../../app/src/state/Stream';
import getStateManager from '../state/getStateManager';
import additional from '../data/additional';
import { hashData } from '../data/util';

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;
const DATA_THRESHOLD = 0.2;

const UPDATE_TIME_KEY = 'data_update_time';
const ADDITIONAL_HASH_KEY = 'additional_data_hash';

const ADDITIONAL_DATA = additional.unsw;
const ADDITIONAL_DATA_HASH = hashData(ADDITIONAL_DATA);

const CLASSUTIL = 'http://classutil.unsw.edu.au';

const START_TERM = 1;
const END_TERM = 3;

export class UNSWScraper extends CampusScraper {
  readonly campus = 'unsw';
  protected state: StateManager;
  readonly parser: Parser;
  maxFaculties = Infinity;

  protected dataUpdateTime: string | undefined;


  constructor (parser: Parser, state: StateManager) {
    super();
    this.parser = parser;
    this.state = state;
  }

  static async create ({
    parser,
    state,
  }: {
    parser?: Parser,
    state?: StateManager,
  } = {}) {
    parser = parser || new Parser();
    state = state || await getStateManager();
    return new UNSWScraper(parser, state);
  }

  async scrape (): Promise<CampusData[] | null> {
    const facultyPages = await this.findFacultyPages();
    if (!await this.checkIfDataUpdated()) {
      this.log('data has not been updated yet; nothing to do');
      return null;
    }

    let results: CampusData[] = [];
    let currentTerm: number | null = null;
    for (let term = START_TERM; term <= END_TERM; term++) {
      const courses = await this.scrapeTerm(term, facultyPages);

      // Assume that the current term is the latest one with stream data available for enough of their courses
      if (currentTerm === null) {
        const hasStreamData = courses.filter(c => c.streams.length > 0);
        if (hasStreamData.length > courses.length * DATA_THRESHOLD) {
          currentTerm = term;
        }
      }

      const meta = this.generateMetaData(term, CLASSUTIL);
      results.push({
        campus: this.campus,
        courses,
        meta,
        current: term === currentTerm,
      });
    }

    if (this.state) {
      this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      this.state.set(this.campus, ADDITIONAL_HASH_KEY, ADDITIONAL_DATA_HASH);
      this.log(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
    }

    return results;
  }

  async scrapeTerm (term: number, facultyPages: string[]) {
    this.log(`scraping term ${term} from ${CLASSUTIL}`);
    facultyPages = facultyPages.filter(l => l.endsWith(`${term}.html`));

    const courses = await this.scrapeFacultyPages(facultyPages);
    return courses;
  }

  private async checkIfDataUpdated () {
    // Update data if source has changed
    const lastUpdateTime = await this.state.get(this.campus, UPDATE_TIME_KEY);
    if (lastUpdateTime !== this.dataUpdateTime) {
      return true;
    }

    // Update data if additional data has changed
    const oldAdditionalHash = await this.state.get(this.campus, ADDITIONAL_HASH_KEY);
    if (ADDITIONAL_DATA_HASH !== oldAdditionalHash) {
      return true;
    }

    return false;
  }

  private getUpdateTime ($: CheerioStatic) {
    const timeText = $('p>strong').text();
    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ;
  }

  private async findFacultyPages () {
    const links: string[] = [];
    const linkRegex = /[A-Y][A-Z]{3}_[ST][0-9].html$/i;
    await this.scrapePages([CLASSUTIL], async ($) => {
      const allLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = allLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);

      this.getUpdateTime($);
    });

    links.length = Math.min(links.length, this.maxFaculties);

    this.log(`found ${links.length} faculy pages`);
    return links;
  }

  private async scrapeFacultyPages (pages: string[]) {
    const urls = pages.map(page => `${CLASSUTIL}/${page}`);
    const results = await this.scrapePages(urls, page => this.parser.parseFacultyPage(page));
    const allCourses = results.flat();

    // Remove duplicate streams from each course
    for (let course of allCourses) {
      removeDuplicateStreams(course);
    }

    // Add (campus-specific) additional events
    allCourses.push(...ADDITIONAL_DATA);

    // Sort courses for consistency
    allCourses.sort(courseSort);

    this.log(`parsed ${allCourses.length} courses`);
    return allCourses;
  }
}

export default UNSWScraper;


export class Parser {
  courseNames: { [code: string]: string } = require('../data/courses-unsw.json');

  async parseFacultyPage ($: CheerioStatic): Promise<CourseData[]> {
    // Get all rows of the table
    const rows = Array.from($($('table').get(2)).find('tr'));

    // Remove first row (which is the header)
    const bodyRows = rows.slice(1);
    const courses: CourseData[] = [];

    for (const row of bodyRows) {
      const cells = $(row).find('td');

      if (cells.length === TABLE_END_COUNT) {
        break;
      } else if (cells.length === COURSE_HEADING_COUNT) {
        const course = this.parseCourse(
          $(cells.get(0)).text(),
          $(cells.get(1)).text(),
        );
        courses.push(course);
      } else if (cells.length === REGULAR_CELL_COUNT) {
        const course = courses[courses.length - 1];
        const stream = this.parseStream(
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
    }

    return courses;
  }

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
    const full = status === 'full' ? true : undefined;

    const enrols = enrolString.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
    if (enrols[1] === 0) {
      return null;
    }

    let web = undefined;
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

      const commaIndex = otherDetails.indexOf(', ');
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
    time = time.replace(':30', '.5');

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
        const index = course.streams.indexOf(stream);
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

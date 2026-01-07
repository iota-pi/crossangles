import * as cheerio from 'cheerio'
import { performance } from 'perf_hooks'
import { Logger } from 'winston'
import axios from './axios'
import AsyncQueue from './AsyncQueue'
import HTMLCache from './HTMLCache'
import { CourseData } from '../../app/src/state/Course'
import { Meta } from '../../app/src/state/Meta'
import { getLogger } from '../logging'


export interface CampusData {
  campus: string,
  courses: CourseData[],
  meta: Meta,
  current: boolean,
}

export class Scraper {
  maxRequests: number = 10
  cache: HTMLCache
  fetchTimes: number[]
  parseTimes: number[]
  logger: Logger

  constructor(cache?: HTMLCache) {
    this.cache = cache || new HTMLCache()
    this.fetchTimes = []
    this.parseTimes = []
    this.logger = getLogger('Scraper')
  }

  async scrapePages<T>(
    urls: string[],
    handler: (page: cheerio.CheerioAPI, url: string) => Promise<T>,
  ): Promise<T[]> {
    const queue = new AsyncQueue<string, T>(this.maxRequests)
    queue.enqueue(urls)
    const processor = async (url: string) => {
      const preFetchTime = performance.now()
      const content = await this.getPageContent(url).catch(error => {
        this.logger.error('Error while fetching', { url, stack: error.stack })
        return null
      })
      if (content === null) return null
      const preParseTime = performance.now()
      this.fetchTimes.push(preParseTime - preFetchTime)

      const result = await handler(content, url).catch((error: Error) => {
        const { message, stack } = error
        this.logger.error(
          'Error while scraping',
          {
            error: { message, stack },
            url,
          },
        )
        return null
      })
      this.parseTimes.push(performance.now() - preParseTime)
      return result
    }
    const parsingPromises = await queue.run(processor)
    return Promise.all(parsingPromises)
  }

  async getPageContent(url: string) {
    let content: string
    let loadedFromCache = false
    if (this.cache.has(url)) {
      this.logger.info(`Fetching page content from cache for ${url}`)
      content = this.cache.get(url)!
      loadedFromCache = true
    } else {
      const response = await axios.get<string>(url)
      content = response.data
    }

    const page = cheerio.load(content)

    if (!loadedFromCache) {
      this.cache.set(url, page.html())
    }

    return page
  }

  private get averageFetchTime() {
    return this.fetchTimes.reduce((sum, x) => sum + x, 0) / this.fetchTimes.length
  }

  private get averageParseTime() {
    return this.parseTimes.reduce((sum, x) => sum + x, 0) / this.parseTimes.length
  }

  report() {
    this.logger.info(
      'Scraper statistics',
      {
        averageFetchTime: this.averageFetchTime,
        averageParseTime: this.averageParseTime,
        pagesFetched: this.fetchTimes.length,
        pagesParsed: this.parseTimes.length,
      },
    )
  }
}

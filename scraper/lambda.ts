import scrapeCampus from './scrapeCampus'
import code_version from './version'
import { getLogger } from './logging'

const bucketName = process.env.S3_OUTPUT_BUCKET || 'crossangles-course-data'
export const S3_BUCKET = `s3://${bucketName}/`

const logger = getLogger('LambdaEntry')

export interface CloudwatchScraperEvent {
  campuses: string[],
}

export const handler = async (event: CloudwatchScraperEvent) => {
  const { campuses } = event
  logger.info('Scraper invoked', { code_version, event })
  const promises: Promise<void>[] = []
  for (const campus of campuses) {
     
    const promise = scrapeCampus(campus, S3_BUCKET).catch(e => {
      logger.error(`Error while scraping for ${campus.toUpperCase()}`, e)
      process.exitCode = 1
    })
    promises.push(promise)
  }

  return Promise.all(promises)
}

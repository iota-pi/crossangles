import { getWriter } from './writer'
import { CampusData } from './scraper/Scraper'
import { getLogger } from './logging'

const logger = getLogger('writeData')

export async function writeData(
  data: CampusData[],
  outputPrefix: string,
  campus: string,
) {
  const writeDataPromises: Promise<void>[] = []
  for (const term of data) {
    logger.info(`Writing term ${term.meta.term} data`)
    writeDataPromises.push(writeTermData(outputPrefix, campus, term))

    if (term.current) {
      logger.info('Writing current data', { term: term.meta.term })
      writeDataPromises.push(writeTermData(outputPrefix, campus, term, true))
    }
  }
  return Promise.all(writeDataPromises)
}

async function writeTermData(
  outputPrefix: string,
  campus: string,
  termData: CampusData,
  current?: boolean,
) {
  const { term, year } = termData.meta
  let destination: string
  if (current) {
    destination = `${outputPrefix}${campus}/data.json`
  } else {
    destination = `${outputPrefix}${campus}/data-${year}T${term}.json`
  }
  const output = getWriter(destination)
  const size = await output.write(termData)
  logger.info('Data written', { destination, dataFileSize: size, term, current })
}

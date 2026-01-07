import { getWriter } from './writer'
import { CampusData } from './scraper/Scraper'
import { UNSW, scrapeUNSW } from './scraper/unsw/scrapeUNSW'
import getStateManager from './state/getStateManager'
import { checkVersionChange, updateVersion } from './state/util'
import { getLogger } from './logging'
import CampusError from './scraper/CampusError'
import StateManager from './state/StateManager'

const logger = getLogger('scrapeCampus')

export interface ScrapeCampusArgs {
  state?: StateManager | null,
  forceUpdate?: boolean,
}

async function scrapeCampus(
  campus: string,
  outputPrefix: string = '',
  useState = true,
) {
  const state = useState ? getStateManager() : null

  let forceUpdate = !useState
  if (state && await checkVersionChange(campus, state)) {
    await updateVersion(campus, state)
    forceUpdate = true
    logger.info('Scraper code updated, forcing data update.')
  }

  let data: CampusData[] | null = null
  logger.info('Invoking campus scraper', { campus, forceUpdate })
  switch (campus) {
    case UNSW:
      data = await scrapeUNSW({ state, forceUpdate })
      break
    default:
      throw new CampusError(`Unhandled campus ${campus}`)
  }

  if (data) {
    const writeDataPromises: Promise<void>[] = []
    for (const term of data) {
      logger.info(`Writing term ${term.meta.term} data`)
      writeDataPromises.push(writeTermData(outputPrefix, campus, term))

      if (term.current) {
        logger.info('Writing current data', { term: term.meta.term })
        writeDataPromises.push(writeTermData(outputPrefix, campus, term, true))
      }
    }
    await Promise.all(writeDataPromises)
  } else {
    logger.info('No data written')
  }
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
  logger.info('Data written', { dataFileSize: size, term, current })
}

export default scrapeCampus

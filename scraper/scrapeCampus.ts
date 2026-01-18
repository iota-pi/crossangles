import { UNSW, scrapeUNSW } from './scraper/unsw/scrapeUNSW'
import getStateManager from './state/getStateManager'
import { getLogger } from './logging'
import CampusError from './scraper/CampusError'

const logger = getLogger('scrapeCampus')

async function scrapeCampus(
  campus: string,
  outputPrefix: string = '',
  useState = true,
) {
  const state = useState ? getStateManager() : null

  logger.info('Invoking campus scraper', { campus })
  switch (campus) {
    case UNSW:
      await scrapeUNSW({ state, outputPrefix })
      break
    default:
      throw new CampusError(`Unhandled campus ${campus}`)
  }
}

export default scrapeCampus

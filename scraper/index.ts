import scrapeCampus from './scrapeCampus';
import { getLogger } from './logging';

const logger = getLogger('LocalEntry');

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let arg of args) {
    const campus = arg.toLowerCase();
    const outputDir = '../app/public/';
    const cacheFile = `./${campus}-snapshot-full.json.br`;
    const promise = scrapeCampus(campus, outputDir, cacheFile, false).catch(e => {
      logger.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  await Promise.all(promises);
}

main();

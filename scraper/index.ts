import scrapeCampus from './scrapeCampus';
import { getLogger } from './logging';

const logger = getLogger('LocalEntry');

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (const arg of args) {
    const campus = arg.toLowerCase();
    const outputDir = '../app/public/';
    const promise = scrapeCampus(campus, outputDir, false).catch(e => {
      logger.error(e.toString());
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  await Promise.all(promises);
};

main();

import scrapeCampus from "./scrapeCampus";

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let campus of args) {
    const outputDir = 'output/'
    const cacheFile = `./${campus}-snapshot.json.br`;
    const promise = scrapeCampus(campus, outputDir, cacheFile).catch(e => {
      console.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  await Promise.all(promises);
}

main();

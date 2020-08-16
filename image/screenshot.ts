import chromium from 'chrome-aws-lambda';
import { Browser } from 'puppeteer-core';
import { getLogger } from './logging';

const logger = getLogger('screenshot');

function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const screenshot = async (
  uri: string,
  viewport?: { width: number, height: number },
): Promise<string> => {
  let browser: Browser | undefined;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: { ...chromium.defaultViewport, ...viewport },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    logger.info('creating new page');
    const page = await browser.newPage();

    logger.info('navigating to page');
    await page.goto(uri);

    logger.info('looking for a session in the timetable');
    await Promise.race([
      page.waitForSelector('[data-cy="timetable-session"]', { timeout: 5000 }),
      page.waitForSelector('[data-session]', { timeout: 5000 }),
    ]);

    // Waiting for a bit here adds an extra layer of protection for slow rendering/animations
    await sleep(350);

    logger.info('found session, taking screenshot');
    const result = await page.screenshot({ encoding: 'base64' });
    return result;
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }
}

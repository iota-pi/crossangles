import chromium from 'chrome-aws-lambda';
import { Browser } from 'puppeteer-core';

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
    console.log('Creating new page');
    const page = await browser.newPage();

    console.log('Navigating to page');
    await page.goto(uri);

    console.log('Looking for a session in the timetable');
    await Promise.race([
      page.waitForSelector('[data-cy="timetable-session"]', { timeout: 5000 }),
      page.waitForSelector('[data-session]', { timeout: 5000 }),
    ]);

    // Waiting for a bit here adds an extra layer of protection for slow rendering/animations
    await sleep(350);

    console.log('Found session, taking screenshot');
    const result = await page.screenshot({ encoding: 'base64' });
    return result;
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }
}

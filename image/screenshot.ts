import chromium from 'chrome-aws-lambda';
import { Browser } from 'puppeteer';

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
    const page = await browser.newPage();
    await page.goto(uri);
    await Promise.race([
      page.waitForSelector('[data-cy="timetable-session"]', { timeout: 5000 }),
      page.waitForSelector('[data-session]', { timeout: 5000 }),
    ]);

    const result = await page.screenshot({ encoding: 'base64' });
    return result;
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }
}

import chromium from 'chrome-aws-lambda';
import { Browser } from 'puppeteer';

export const screenshot = async (uri: string): Promise<string> => {
  let browser: Browser | undefined;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(uri);

    const result = await page.screenshot({ encoding: 'base64', fullPage: true });
    return result;
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }
}

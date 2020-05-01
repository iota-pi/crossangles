import axios from 'axios';
import secrets from './secrets';

export const screenshot = async (
  uri: string,
  viewport?: { width: number, height: number },
): Promise<string> => {
  const endpoint = `https://phantomjscloud.com/api/browser/v2/${secrets.pjsc_key}/`;

  const data = {
    url: uri,
    renderType: 'png',
    requestSettings: {
      webSecurityEnabled: true,
      resourceTimeout: 3000,    // maximum wait for a resource
      maxWait: 5000,            // maximum wait for the whole page
    },
    renderSettings: {
      viewport: viewport,
      clipRectangle: viewport,
    },
    backend: 'chrome',
  };

  const result = await axios.post(endpoint, data);
  const image = Buffer.from(result.data).toString('base64');
  return image;
}

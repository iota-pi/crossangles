import axios from 'axios';
import axiosRetry, { exponentialDelay } from 'axios-retry';
import http from 'http';
import https from 'https';

const customisedAxios = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  maxContentLength: 50 * 1000 * 1000,
  timeout: 10000,
});
axiosRetry(customisedAxios, { retryDelay: exponentialDelay });

export default customisedAxios;

// This shim import/export file exists to workaround a limitation with
// create-react-app and the webpack import syntax in `.tsx` files.

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import createFilterWorker, { Workerized } from 'workerize-loader!./filter.worker';

export default createFilterWorker;
export { createFilterWorker };
export type { Workerized };

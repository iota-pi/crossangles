// This shim import/export file exists primarily to work around a limitation with
// create-react-app and the webpack import syntax in `.tsx` files.

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import createFilterWorker, { Workerized } from 'workerize-loader!./filter.worker';

import React from 'react';
import * as filterWorker from './filter.worker';

export type WorkerizedModule = typeof filterWorker;
export type Worker = Workerized<WorkerizedModule>;

export default createFilterWorker;
export { createFilterWorker };

export function useFilterWorker() {
  const worker: Worker = React.useMemo(
    () => createFilterWorker<typeof filterWorker>(),
    [],
  );
  return worker;
}

/*
 * A simple genetic search algorithm
 *
 * To reduce the chance of getting stuck in a local maxima, run the `search`
 * method with a lower `maxIterations` and run it multiple times, keeping
 * the best.
 *
 * Please note that `mutate` and `scoreFunction` are hot (performance-critical)
 * code
 */
/* eslint-disable no-param-reassign */

export interface GeneticSearchOptionalConfig {
  timeout?: number, // max execution time in milliseconds
  maxIterations?: number,
  checkIters?: number,
  initialParents?: number,
  maxParents?: number,
  biasTop?: number,
}

export interface GeneticSearchRequiredConfig<T> {
  scoreFunction: (result: T[], indexes: number[]) => number,
}

export type GeneticSearchConfig<T> = GeneticSearchOptionalConfig & GeneticSearchRequiredConfig<T>;

const defaultConfig: Required<GeneticSearchOptionalConfig> = {
  timeout: 500,
  maxIterations: 5000,
  checkIters: 10,
  initialParents: 100,
  maxParents: 20,
  biasTop: 5,
};

export interface Parent<T> {
  indexes: number[],
  values: T[],
  score: number,
}

export class GeneticSearch<T> {
  config: Required<GeneticSearchConfig<T>>;

  constructor(config: GeneticSearchConfig<T>) {
    this.config = { ...defaultConfig, ...config };
  }

  search(data: T[][]): Parent<T> {
    if (data.length === 0) {
      return {
        indexes: [],
        values: [],
        score: -Infinity,
      };
    }

    const startTime = performance.now();

    const parents = this.abiogenesis(data);

    const max = this.config.maxIterations;
    const checkIters = this.config.checkIters;
    for (let i = 0; i < max; ++i) {
      parents.push(this.mutate(this.chooseParent(parents), data));

      if (i % checkIters === 0) {
        // Re-sort parents then remove the worst ones
        this.cullParents(parents);

        if (performance.now() - startTime >= this.config.timeout) {
          console.warn(`search(): max search time exceeded after ${i} iterations`);
          break;
        }
      }
    }

    // Give best result
    return parents[0];
  }

  abiogenesis(data: T[][]): Parent<T>[] {
    const parents: Parent<T>[] = [];
    for (let i = 0; i < this.config.initialParents; ++i) {
      const indexes = data.map(x => Math.floor(Math.random() * x.length));
      const values = indexes.map((index, j) => data[j][index]);
      const score = this.config.scoreFunction(values, indexes);
      parents.push({ indexes, values, score });
    }

    return parents.sort(this.parentSort);
  }

  evolve(parents: Parent<T>[], data: T[][]): Parent<T>[] {
    // Create new parents
    const numParents = parents.length;
    for (let i = 0; i < numParents; ++i) {
      parents.push(this.mutate(parents[i], data));
    }

    // Sort parents by score
    parents.sort(this.parentSort);

    // Throw out excess parents
    parents.splice(this.config.maxParents);

    return parents;
  }

  mutate(parent: Parent<T>, data: T[][]): Parent<T> {
    const values = parent.values.slice();
    let indexes = parent.indexes;

    // Mutate child
    const i = this.chooseIndexToMutate(data);
    const newIndex = this.chooseNewIndexValue(indexes[i], data[i].length);

    values[i] = data[i][newIndex];
    const score = this.config.scoreFunction(values, indexes);

    // Copy and update indexes only if score is passable (i.e. not -Infinity)
    if (Number.isFinite(score)) {
      indexes = indexes.slice();
      indexes[i] = newIndex;
    }

    return { values, indexes, score };
  }

  chooseIndexToMutate(data: T[][], max_attempts = 10): number {
    let i = -1;
    let attempts = 0;
    while (i < 0 || data[i].length <= 1) {
      i = this.randInt(data.length);
      attempts += 1;
      if (attempts > max_attempts) break;
    }
    return i;
  }

  chooseNewIndexValue(previous: number, max: number, max_attempts = 10): number {
    let n = previous;
    let attempts = 0;
    while (n === previous) {
      n = this.randInt(max);
      attempts += 1;
      if (attempts > max_attempts) break;
    }
    return n;
  }

  private randInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  private parentSort(a: Parent<T>, b: Parent<T>) {
    return b.score - a.score;
  }

  private chooseParent(parents: Parent<T>[]): Parent<T> {
    const i = Math.floor(Math.random() * parents.length + this.config.biasTop) % parents.length;
    return parents[i];
  }

  private cullParents(parents: Parent<T>[]): void {
    parents.sort(this.parentSort);
    const max = this.config.maxParents;
    if (parents.length > max) {
      parents.length = max;
    }
  }
}

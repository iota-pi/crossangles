export interface GeneticSearchOptionalConfig {
  maxTime?: number,  // time in milliseconds
  maxIterations?: number,
  checkIters?: number,
  initialParents?: number,
  maxParents?: number,
  biasTop?: number,
}

export interface GeneticSearchRequiredConfig<T> {
  scoreFunction: (result: T[]) => number,
}

export type GeneticSearchConfig<T> = GeneticSearchOptionalConfig & GeneticSearchRequiredConfig<T>;

const defaultConfig: Required<GeneticSearchOptionalConfig> = {
  maxTime: 500,
  maxIterations: 10000,
  checkIters: 10,
  initialParents: 100,
  maxParents: 20,
  biasTop: 5,
}

export interface Parent<T> {
  indexes: number[],
  values: T[],
  score: number,
}

export class GeneticSearch<T> {
  config: Required<GeneticSearchConfig<T>>;

  constructor (config: GeneticSearchConfig<T>) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  search (data: T[][]): Parent<T> {
    const startTime = performance.now();

    let parents = this.abiogenesis(data);

    for (let i = 0; i < this.config.maxIterations; ++i) {
      parents.push(this.mutate(this.chooseParent(parents), data));

      if (i % this.config.checkIters === 0) {
        // Re-sort parents then remove the worst ones
        this.cullParents(parents);

        if (performance.now() - startTime >= this.config.maxTime) {
          console.warn(`search(): max search time exceeded after ${i} iterations`)
          break;
        }
      }
    }

    // Give best result
    return parents[0]
  }

  abiogenesis (data: T[][]): Parent<T>[] {
    const parents: Parent<T>[] = [];
    for (let i = 0; i < this.config.initialParents; ++i) {
      const parent = data.map(x => Math.floor(Math.random() * x.length));
      const mapped = parent.map((n, i) => data[i][n]);
      const score = this.config.scoreFunction(mapped);
      parents.push({
        indexes: parent,
        values: mapped,
        score,
      });
    }

    return parents.sort(this.parentSort);
  }

  evolve (parents: Parent<T>[], data: T[][]): Parent<T>[] {
    // Create new parents
    const numParents = parents.length
    for (let i = 0; i < numParents; ++i) {
      parents.push(this.mutate(parents[i], data));
    }

    // Sort parents by score
    parents.sort(this.parentSort);

    // Throw out excess parents
    parents.splice(this.config.maxParents);

    return parents;
  }

  mutate (parent: Parent<T>, data: T[][]): Parent<T> {
    // Make a copy of the parent
    const child = Object.assign({}, parent);

    // Mutate child
    const i = Math.floor(Math.random() * child.indexes.length);
    const newIndex = Math.floor(Math.random() * data[i].length);

    child.values = child.values.slice();
    child.values[i] = data[i][newIndex];
    child.score = this.config.scoreFunction(child.values);

    // Copy and update indexes only if score is passable (i.e. not -Infinity)
    if (Number.isFinite(child.score)) {
      child.indexes = child.indexes.slice();
      child.indexes[i] = newIndex;
    }

    return child;
  }

  private parentSort (a: Parent<T>, b: Parent<T>) {
    return b.score - a.score;
  }

  private chooseParent (parents: Parent<T>[]): Parent<T> {
    const i = Math.floor(Math.random() * parents.length + this.config.biasTop) % parents.length;
    return parents[i];
  }

  private cullParents (parents: Parent<T>[]): void {
    parents.sort(this.parentSort);
    parents.splice(this.config.maxParents);
  }
}

import AsyncQueue from './AsyncQueue';

describe('AsyncQueue', () => {
  it('limits async function calls', async () => {
    const itemCount = 5;
    const maxConcurrent = 2;
    let concurrentCount = 0;
    let totalCount = 0;
    let highestConcurrency = 0;

    const func = (result: number) => new Promise<number>(resolve => {
      concurrentCount += 1;
      highestConcurrency = Math.max(highestConcurrency, concurrentCount);

      setTimeout(() => {
        concurrentCount -= 1;
        totalCount += 1;
        resolve(result);
      }, 10);
    });

    const queue = new AsyncQueue<number, number>(maxConcurrent);
    const items = new Array(itemCount).fill(0).map((_, i) => i);
    queue.enqueue(items);
    const result = await queue.run(func);
    expect(highestConcurrency).toBe(maxConcurrent);
    expect(totalCount).toBe(itemCount);
    expect(result).toEqual(items);
  });
});

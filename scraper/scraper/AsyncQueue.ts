export class AsyncQueue<T, R> {
  private queue: T[] = [];
  private results: R[] = [];

  constructor (private maxRequests: number) {}

  enqueue (items: T[]) {
    const reversedItems = items.slice().reverse();
    this.queue.unshift(...reversedItems);
  }

  async run (func: (item: T) => Promise<R | null>): Promise<R[]> {
    const senders: Promise<void>[] = [];

    for (let i = 0; i < this.maxRequests; ++i) {
      senders.push(this.send(func));
    }

    await Promise.all(senders);
    return this.results;
  }

  async send (func: (item: T) => Promise<R | null>) {
    while (this.queue.length) {
      const item = this.queue.pop();

      if (item !== undefined) {
        const result = await func(item);
        if (result !== null) {
          this.results.push(result);
        }
      }
    }
  }
}

export default AsyncQueue;

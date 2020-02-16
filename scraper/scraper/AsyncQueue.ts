export class AsyncQueue<T, R> {
  private queue: T[] = [];
  private results: R[] = [];

  constructor (private maxRequests: number) {}

  enqueue (items: T[]) {
    const reversedItems = items.slice().reverse();
    this.queue.unshift(...reversedItems);
  }

  async run (func: (item: T) => Promise<R>): Promise<R[]> {
    const senders: Promise<void>[] = [];

    for (let i = 0; i < this.maxRequests; ++i) {
      senders.push(this.send(func));
    }

    await Promise.all(senders);
    return this.results;
  }

  async send (func: (item: T) => Promise<R>) {
    while (this.queue.length) {
      const item = this.queue.pop();

      if (item !== undefined) {
        this.results.push(await func(item));
      }
    }
  }
}

export default AsyncQueue;

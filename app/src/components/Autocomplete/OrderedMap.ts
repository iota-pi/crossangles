export class OrderedMap<K, V> extends Map<K, V> {
  private order: K[] = [];
  readonly capacity: number;

  constructor (entries?: [K, V][] | null, capacity = 20) {
    super(entries);
    this.capacity = capacity;
  }

  get (key: K) {
    const result = super.get(key);
    if (result !== undefined) {
      this.bump(key);
    }
    return result;
  }

  set (key: K, value: V) {
    this.delete(key);
    super.set(key, value);
    this.bump(key);

    return this;
  }

  delete (key: K) {
    if (super.delete(key)) {
      this.order.splice(this.order.indexOf(key), 1);
      return true;
    } else {
      return false;
    }
  }

  private bump (key: K) {
    this.order.push(key);
    if (this.order.length > this.capacity) {
      this.order.unshift();
    }
  }
}

export default OrderedMap;

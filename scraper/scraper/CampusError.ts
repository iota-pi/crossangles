class CampusError extends Error {
  readonly name = 'CampusError';

  toString() {
    return `${this.name}: ${this.message}`;
  }
}
export default CampusError;

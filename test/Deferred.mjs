// @ts-check

/**
 * Deferred promise that can be externally resolved or rejected.
 * @template T
 */
export default class Deferred {
  constructor() {
    /**
     * The promise.
     * @type {Promise<T>}
     */
    this.promise = new Promise((resolve, reject) => {
      /** Resolves the promise. */
      this.resolve = resolve;

      /** Rejects the promise. */
      this.reject = reject;
    });
  }
}

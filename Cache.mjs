// @ts-check

/**
 * Cache store.
 * @see {@link CacheEventMap `CacheEventMap`} for a map of possible events.
 */
export default class Cache extends EventTarget {
  /**
   * @param {CacheStore} [store] Initial {@link Cache.store cache store}.
   *   Defaults to `{}`. Useful for hydrating cache data from a server side
   *   render prior to the initial client side render.
   */
  constructor(store = {}) {
    super();

    if (typeof store !== "object" || !store || Array.isArray(store))
      throw new TypeError("Constructor argument 1 `store` must be an object.");

    /**
     * Store of cache {@link CacheKey keys} and associated
     * {@link CacheValue values}.
     * @type {CacheStore}
     */
    this.store = store;
  }
}

/**
 * Map of possible {@linkcode Cache} events. Note that the keys don’t match the
 * dispatched event names that dynamically contain the associated
 * {@link CacheKey cache key}.
 * @typedef {object} CacheEventMap
 * @prop {CustomEvent<CacheEventSetDetail>} set Signals that a
 *   {@link Cache.store cache store} entry was set. The event name starts with
 *   the {@link CacheKey cache key} of the set entry, followed by `/set`.
 * @prop {CustomEvent} stale Signals that a {@link Cache.store cache store}
 *   entry is now stale (often due to a mutation) and should probably be
 *   reloaded. The event name starts with the
 *   {@link CacheKey cache key} of the stale entry, followed by `/stale`.
 * @prop {CustomEvent} prune Signals that a {@link Cache.store cache store}
 *   entry will be deleted unless the event is canceled via
 *   `event.preventDefault()`. The event name starts with the
 *   {@link CacheKey cache key} of the entry being pruned, followed by `/prune`.
 * @prop {CustomEvent} delete Signals that a {@link Cache.store cache store}
 *   entry was deleted. The event name starts with the
 *   {@link CacheKey cache key} of the deleted entry, followed by `/delete`.
 */

/**
 * @typedef {object} CacheEventSetDetail
 * @prop {CacheValue} cacheValue The set {@link CacheValue cache value}.
 */

/**
 * Unique key to access a {@link CacheValue cache value}.
 * @typedef {string} CacheKey
 */

/**
 * {@link Cache.store Cache store} value. If server side rendering, it should
 * be JSON serializable for client hydration. It should contain information
 * about any errors that occurred during loading so they can be rendered, and if
 * server side rendering, be hydrated on the client.
 * @typedef {unknown} CacheValue
 */

/**
 * Cache store.
 * @typedef {{ [cacheKey: CacheKey]: CacheValue }} CacheStore
 */

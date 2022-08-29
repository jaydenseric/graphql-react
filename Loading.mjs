// @ts-check

/** @typedef {import("./Cache.mjs").CacheKey} CacheKey */
/** @typedef {import("./Cache.mjs").CacheValue} CacheValue */
/** @typedef {import("./LoadingCacheValue.mjs").default} LoadingCacheValue */

/**
 * Loading store.
 * @see {@link LoadingEventMap `LoadingEventMap`} for a map of possible events.
 */
export default class Loading extends EventTarget {
  constructor() {
    super();

    /**
     * Store of loading {@link CacheKey cache keys} and associated
     * {@link LoadingCacheValue loading cache values}. Multiple for the same key
     * are set in the order loading started.
     * @type {{ [cacheKey: CacheKey]: Set<LoadingCacheValue> }}
     */
    this.store = {};
  }
}

/**
 * Map of possible {@linkcode Loading} events. Note that the keys don’t match
 * the dispatched event names that dynamically contain the associated
 * {@link CacheKey cache key}.
 * @typedef {object} LoadingEventMap
 * @prop {CustomEvent<LoadingEventStartDetail>} start Signals the start of
 *   {@link LoadingCacheValue loading a cache value}. The event name starts with
 *   the {@link CacheKey cache key}, followed by `/start`.
 * @prop {CustomEvent<LoadingEventEndDetail>} end Signals the end of
 *   {@link LoadingCacheValue loading a cache value}; either the loading
 *   finished and the {@link CacheValue cache value} was set, the loading was
 *   aborted, or there was an error. The event name starts with the
 *   {@link CacheKey cache key}, followed by `/end`.
 */

/**
 * @typedef {object} LoadingEventStartDetail
 * @prop {LoadingCacheValue} loadingCacheValue Loading cache value that started.
 */

/**
 * @typedef {object} LoadingEventEndDetail
 * @prop {LoadingCacheValue} loadingCacheValue Loading cache value that ended.
 */

import createArgErrorMessageProd from './createArgErrorMessageProd.mjs';

/**
 * Cache store.
 * @kind class
 * @name Cache
 * @param {object} [store={}] Initial [cache store]{@link Cache#store}. Useful for hydrating cache data from a server side render prior to the initial client side render.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import Cache from 'graphql-react/Cache.mjs';
 * ```
 * @example <caption>Construct a new instance.</caption>
 * ```js
 * const cache = new Cache();
 * ```
 */
export default class Cache extends EventTarget {
  constructor(store = {}) {
    super();

    if (typeof store !== 'object' || !store || Array.isArray(store))
      throw new TypeError(
        typeof process === 'object' && process.env.NODE_ENV !== 'production'
          ? 'Constructor argument 1 `store` must be an object.'
          : createArgErrorMessageProd(1)
      );

    /**
     * Store of cache [keys]{@link CacheKey} and [values]{@link CacheValue}.
     * @kind member
     * @name Cache#store
     * @type {object}
     */
    this.store = store;
  }
}

/**
 * Signals that a [cache store]{@link Cache#store} entry was set. The event name
 * starts with the [cache key]{@link CacheKey} of the set entry, followed by
 * `/set`.
 * @kind event
 * @name Cache#event:set
 * @type {CustomEvent}
 * @prop {object} detail Event detail.
 * @prop {CacheValue} detail.cacheValue Cache value that was set.
 */

/**
 * Signals that a [cache store]{@link Cache#store} entry is now stale (often due
 * to a mutation) and should probably be reloaded. The event name starts with
 * the [cache key]{@link CacheKey} of the stale entry, followed by `/stale`.
 * @kind event
 * @name Cache#event:stale
 * @type {CustomEvent}
 */

/**
 * Signals that a [cache store]{@link Cache#store} entry will be deleted unless
 * the event is canceled via `event.preventDefault()`. The event name starts
 * with the [cache key]{@link CacheKey} of the entry being pruned, followed by
 * `/prune`.
 * @kind event
 * @name Cache#event:prune
 * @type {CustomEvent}
 */

/**
 * Signals that a [cache store]{@link Cache#store} entry was deleted. The event
 * name starts with the [cache key]{@link CacheKey} of the deleted entry,
 * followed by `/delete`.
 * @kind event
 * @name Cache#event:delete
 * @type {CustomEvent}
 */

import Cache from "./Cache.mjs";

/**
 * Stales a [cache]{@link Cache#store} entry, signalling it should probably be
 * reloaded.
 * @kind function
 * @name cacheEntryStale
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @fires Cache#event:stale
 * @example <caption>How to import.</caption>
 * ```js
 * import cacheEntryStale from "graphql-react/cacheEntryStale.mjs";
 * ```
 */
export default function cacheEntryStale(cache, cacheKey) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 2 `cacheKey` must be a string.");

  if (!(cacheKey in cache.store))
    throw new Error(`Cache key \`${cacheKey}\` isn’t in the store.`);

  cache.dispatchEvent(new CustomEvent(`${cacheKey}/stale`));
}

// @ts-check

/** @import { CacheEventMap, CacheKey } from "./Cache.mjs" */

import Cache from "./Cache.mjs";

/**
 * Stales a {@link Cache.store cache store} entry (throwing an error if missing)
 * by dispatching the {@linkcode Cache} event
 * {@link CacheEventMap.stale `stale`} to signal it should probably be reloaded.
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
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

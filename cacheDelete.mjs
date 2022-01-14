// @ts-check

import Cache from "./Cache.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";

/** @typedef {import("./Cache.mjs").CacheEventMap} CacheEventMap */
/** @typedef {import("./Cache.mjs").CacheKey} CacheKey */

/**
 * Deletes {@link Cache.store cache store} entries, dispatching the
 * {@linkcode Cache} event {@link CacheEventMap.delete `delete`}. Useful after a
 * user logs out.
 * @param {Cache} cache Cache to update.
 * @param {import("./types.mjs").CacheKeyMatcher} [cacheKeyMatcher] Matches
 *   {@link CacheKey cache keys} to delete. By default all are matched.
 */
export default function cacheDelete(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== "function")
    throw new TypeError("Argument 2 `cacheKeyMatcher` must be a function.");

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryDelete(cache, cacheKey);
}

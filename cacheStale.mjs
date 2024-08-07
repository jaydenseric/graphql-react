// @ts-check

/**
 * @import { CacheKey } from "./Cache.mjs"
 * @import { CacheKeyMatcher } from "./types.mjs"
 */

import Cache from "./Cache.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";

/**
 * Stales {@link Cache.store cache store} entries by using
 * {@linkcode cacheEntryStale} for each entry. Useful after a mutation.
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches
 *   {@link CacheKey cache keys} to stale. By default all are matched.
 */
export default function cacheStale(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== "function")
    throw new TypeError("Argument 2 `cacheKeyMatcher` must be a function.");

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryStale(cache, cacheKey);
}

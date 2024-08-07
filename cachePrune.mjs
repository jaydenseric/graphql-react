// @ts-check

/**
 * @import { CacheKey } from "./Cache.mjs"
 * @import { CacheKeyMatcher } from "./types.mjs"
 */

import Cache from "./Cache.mjs";
import cacheEntryPrune from "./cacheEntryPrune.mjs";

/**
 * Prunes {@link Cache.store cache store} entries by using
 * {@linkcode cacheEntryPrune} for each entry. Useful after a mutation.
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches
 *   {@link CacheKey cache keys} to prune. By default all are matched.
 */
export default function cachePrune(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== "function")
    throw new TypeError("Argument 2 `cacheKeyMatcher` must be a function.");

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryPrune(cache, cacheKey);
}

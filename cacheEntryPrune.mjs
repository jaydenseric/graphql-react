// @ts-check

/** @import { CacheEventMap, CacheKey } from "./Cache.mjs" */

import Cache from "./Cache.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";

/**
 * Prunes a {@link Cache.store cache store} entry (if present) by dispatching
 * the {@linkcode Cache} event {@link CacheEventMap.prune `prune`} and if no
 * listener cancels it via `event.preventDefault()`, using
 * {@linkcode cacheEntryDelete}.
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 */
export default function cacheEntryPrune(cache, cacheKey) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 2 `cacheKey` must be a string.");

  if (cacheKey in cache.store) {
    const notCanceled = cache.dispatchEvent(
      new CustomEvent(`${cacheKey}/prune`, { cancelable: true }),
    );

    if (notCanceled) cacheEntryDelete(cache, cacheKey);
  }
}

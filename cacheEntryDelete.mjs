// @ts-check

/** @import { CacheEventMap, CacheKey } from "./Cache.mjs" */

import Cache from "./Cache.mjs";

/**
 * Deletes a {@link Cache.store cache store} entry, dispatching the
 * {@linkcode Cache} event {@link CacheEventMap.delete `delete`}.
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 */
export default function cacheEntryDelete(cache, cacheKey) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 2 `cacheKey` must be a string.");

  if (cacheKey in cache.store) {
    delete cache.store[cacheKey];

    cache.dispatchEvent(new CustomEvent(`${cacheKey}/delete`));
  }
}

// @ts-check

/** @import { CacheEventMap, CacheKey, CacheValue } from "./Cache.mjs" */

import Cache from "./Cache.mjs";

/**
 * Sets a {@link Cache.store cache store} entry, dispatching the
 * {@linkcode Cache} event {@link CacheEventMap.set `set`}.
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @param {CacheValue} cacheValue Cache value.
 */
export default function cacheEntrySet(cache, cacheKey, cacheValue) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 2 `cacheKey` must be a string.");

  cache.store[cacheKey] = cacheValue;

  cache.dispatchEvent(
    new CustomEvent(`${cacheKey}/set`, {
      detail: {
        cacheValue,
      },
    }),
  );
}

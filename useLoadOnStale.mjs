// @ts-check

/**
 * @import { CacheEventMap, CacheKey } from "./Cache.mjs"
 * @import { Loader } from "./types.mjs"
 */

import React from "react";

import useCache from "./useCache.mjs";

/**
 * React hook to load a {@link Cache.store cache store} entry after becomes
 * {@link CacheEventMap.stale stale}, if there isn’t loading for the
 * {@link CacheKey cache key} that started after.
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 */
export default function useLoadOnStale(cacheKey, load) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  if (typeof load !== "function")
    throw new TypeError("Argument 2 `load` must be a function.");

  const cache = useCache();

  const onCacheEntryStale = React.useCallback(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const eventNameStale = `${cacheKey}/stale`;

    cache.addEventListener(eventNameStale, onCacheEntryStale);

    return () => {
      cache.removeEventListener(eventNameStale, onCacheEntryStale);
    };
  }, [cache, cacheKey, onCacheEntryStale]);
}

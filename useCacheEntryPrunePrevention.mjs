// @ts-check

/** @import Cache, { CacheEventMap, CacheKey } from "./Cache.mjs" */

import React from "react";

import useCache from "./useCache.mjs";

/**
 * React hook to prevent a {@link Cache.store cache store} entry from being
 * pruned, by canceling the cache entry deletion for
 * {@link CacheEventMap.prune `prune`} events with `event.preventDefault()`.
 * @param {CacheKey} cacheKey Cache key.
 */
export default function useCacheEntryPrunePrevention(cacheKey) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  const cache = useCache();

  React.useEffect(() => {
    const eventNamePrune = `${cacheKey}/prune`;

    cache.addEventListener(eventNamePrune, cancelEvent);

    return () => {
      cache.removeEventListener(eventNamePrune, cancelEvent);
    };
  }, [cache, cacheKey]);
}

/**
 * Cancels an event.
 * @param {Event} event Event.
 */
function cancelEvent(event) {
  event.preventDefault();
}

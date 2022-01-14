// @ts-check

import React from "react";
import useCache from "./useCache.mjs";

/** @typedef {import("./Cache.mjs").default} Cache */

/**
 * A React hook to prevent a {@link Cache.store cache store} entry from being
 * pruned, by canceling the cache entry deletion for
 * {@link Cache#event:prune prune events} with `event.preventDefault()`.
 * @param {import("./Cache.mjs").CacheKey} cacheKey Cache key.
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

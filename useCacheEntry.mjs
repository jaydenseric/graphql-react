// @ts-check

import React from "react";

import useCache from "./useCache.mjs";
import useForceUpdate from "./useForceUpdate.mjs";

/** @typedef {import("./Cache.mjs").CacheKey} CacheKey */
/** @typedef {import("./Cache.mjs").CacheValue} CacheValue */

/**
 * React hook to get a {@link CacheValue cache value} using its
 * {@link CacheKey cache key}.
 * @param {CacheKey} cacheKey Cache key.
 * @returns {CacheValue} Cache value, if present.
 */
export default function useCacheEntry(cacheKey) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  const cache = useCache();
  const forceUpdate = useForceUpdate();

  const onTriggerUpdate = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  React.useEffect(() => {
    const eventNameSet = `${cacheKey}/set`;
    const eventNameDelete = `${cacheKey}/delete`;

    cache.addEventListener(eventNameSet, onTriggerUpdate);
    cache.addEventListener(eventNameDelete, onTriggerUpdate);

    return () => {
      cache.removeEventListener(eventNameSet, onTriggerUpdate);
      cache.removeEventListener(eventNameDelete, onTriggerUpdate);
    };
  }, [cache, cacheKey, onTriggerUpdate]);

  const value = cache.store[cacheKey];

  React.useDebugValue(value);

  return value;
}

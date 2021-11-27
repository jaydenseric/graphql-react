import React from "react";
import useCache from "./useCache.mjs";
import useForceUpdate from "./useForceUpdate.mjs";

/**
 * A React hook to get a [cache value]{@link CacheValue} using its
 * [cache key]{@link CacheKey}.
 * @kind function
 * @name useCacheEntry
 * @param {CacheKey} cacheKey Cache key.
 * @returns {CacheValue} Cache value, if present.
 * @example <caption>How to import.</caption>
 * ```js
 * import useCacheEntry from "graphql-react/useCacheEntry.mjs";
 * ```
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

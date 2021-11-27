import React from "react";
import useCache from "./useCache.mjs";

/**
 * A React hook to load a [cache]{@link Cache#store} entry after becomes
 * [stale]{@link Cache#event:stale}, if there isn’t loading for the
 * [cache key]{@link CacheKey} that started after.
 * @kind function
 * @name useLoadOnStale
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoadOnStale from "graphql-react/useLoadOnStale.mjs";
 * ```
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

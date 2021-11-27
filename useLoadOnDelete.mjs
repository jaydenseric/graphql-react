import React from "react";
import useCache from "./useCache.mjs";

/**
 * A React hook to load a [cache]{@link Cache#store} entry after it’s
 * [deleted]{@link Cache#event:delete}, if there isn’t loading for the
 * [cache key]{@link CacheKey} that started after.
 * @kind function
 * @name useLoadOnDelete
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoadOnDelete from "graphql-react/useLoadOnDelete.mjs";
 * ```
 */
export default function useLoadOnDelete(cacheKey, load) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  if (typeof load !== "function")
    throw new TypeError("Argument 2 `load` must be a function.");

  const cache = useCache();

  const onCacheEntryDelete = React.useCallback(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const eventNameDelete = `${cacheKey}/delete`;

    cache.addEventListener(eventNameDelete, onCacheEntryDelete);

    return () => {
      cache.removeEventListener(eventNameDelete, onCacheEntryDelete);
    };
  }, [cache, cacheKey, onCacheEntryDelete]);
}

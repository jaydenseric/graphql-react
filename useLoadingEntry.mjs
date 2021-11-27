import React from "react";
import useForceUpdate from "./useForceUpdate.mjs";
import useLoading from "./useLoading.mjs";

/**
 * A React hook to get the [loading cache values]{@link LoadingCacheValue} for
 * a given [cache key]{@link CacheKey}.
 * @kind function
 * @name useLoadingEntry
 * @param {CacheKey} cacheKey Cache key.
 * @returns {Set<LoadingCacheValue>|undefined} Loading cache values, if present.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoadingEntry from "graphql-react/useLoadingEntry.mjs";
 * ```
 */
export default function useLoadingEntry(cacheKey) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  const loading = useLoading();
  const forceUpdate = useForceUpdate();

  const onTriggerUpdate = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  React.useEffect(() => {
    const eventNameStart = `${cacheKey}/start`;
    const eventNameEnd = `${cacheKey}/end`;

    loading.addEventListener(eventNameStart, onTriggerUpdate);
    loading.addEventListener(eventNameEnd, onTriggerUpdate);

    return () => {
      loading.removeEventListener(eventNameStart, onTriggerUpdate);
      loading.removeEventListener(eventNameEnd, onTriggerUpdate);
    };
  }, [loading, cacheKey, onTriggerUpdate]);

  const value = loading.store[cacheKey];

  React.useDebugValue(value);

  return value;
}

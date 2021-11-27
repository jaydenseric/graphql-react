import React from "react";

/**
 * A React hook to create a memoized [loader]{@link Loader} from another, that
 * automatically aborts previous loading that started via this hook when new
 * loading starts via this hook, the hook arguments change, or the component
 * unmounts.
 * @kind function
 * @name useAutoAbortLoad
 * @param {Loader} load Memoized function that starts the loading.
 * @returns {Loader} Memoized function that starts the loading.
 * @example <caption>How to import.</caption>
 * ```js
 * import useAutoAbortLoad from "graphql-react/useAutoAbortLoad.mjs";
 * ```
 */
export default function useAutoAbortLoad(load) {
  if (typeof load !== "function")
    throw new TypeError("Argument 1 `load` must be a function.");

  const lastLoadingCacheValueRef = React.useRef();

  React.useEffect(
    () => () => {
      if (lastLoadingCacheValueRef.current)
        // Abort the last loading as it’s now redundant due to the changed
        // dependencies. Checking if it’s already ended or aborted first is
        // unnecessary.
        lastLoadingCacheValueRef.current.abortController.abort();
    },
    [load]
  );

  return React.useCallback(() => {
    if (lastLoadingCacheValueRef.current)
      // Ensure the last loading is aborted before starting new loading.
      // Checking if it’s already ended or aborted first is unnecessary.
      lastLoadingCacheValueRef.current.abortController.abort();

    const loadingCacheValue = load();

    lastLoadingCacheValueRef.current = loadingCacheValue;

    // After the loading cache value promise resolves, clear the ref (if it
    // still holds the same loading cache value) to allow garbage collection.
    // This might not be worth the bundle size increase.
    loadingCacheValue.promise.then(() => {
      if (lastLoadingCacheValueRef.current === loadingCacheValue)
        lastLoadingCacheValueRef.current = null;
    });

    return loadingCacheValue;
  }, [load]);
}

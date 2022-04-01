// @ts-check

import React from "react";

import useForceUpdate from "./useForceUpdate.mjs";
import useLoading from "./useLoading.mjs";

/** @typedef {import("./Cache.mjs").CacheKey} CacheKey */
/** @typedef {import("./LoadingCacheValue.mjs").default} LoadingCacheValue */

/**
 * React hook to get the {@link LoadingCacheValue loading cache values} for a
 * given {@link CacheKey cache key}.
 * @param {CacheKey} cacheKey Cache key.
 * @returns {Set<LoadingCacheValue> | undefined} Loading cache values, if
 *   present.
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

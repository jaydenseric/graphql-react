// @ts-check

import useAutoAbortLoad from "./useAutoAbortLoad.mjs";
import useCacheEntryPrunePrevention from "./useCacheEntryPrunePrevention.mjs";
import useLoadOnDelete from "./useLoadOnDelete.mjs";
import useLoadOnMount from "./useLoadOnMount.mjs";
import useLoadOnStale from "./useLoadOnStale.mjs";

/** @typedef {import("./useWaterfallLoad.mjs").default} useWaterfallLoad */
/** @typedef {import("./types.mjs").Loader} Loader */

/**
 * React hook to prevent a {@link Cache.store cache store} entry from being
 * pruned while the component is mounted and automatically keep it loaded.
 * Previous loading that started via this hook aborts when new loading starts
 * via this hook, the hook arguments change, or the component unmounts.
 * @param {import("./Cache.mjs").CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @returns {Loader} Memoized {@link Loader loader} created from the `load`
 *   argument, that automatically aborts the last loading when the memoized
 *   function changes or the component unmounts.
 * @see {@link useCacheEntryPrunePrevention `useCacheEntryPrunePrevention`},
 *   used by this hook.
 * @see {@link useAutoAbortLoad `useAutoAbortLoad`}, used by this hook.
 * @see {@link useLoadOnMount `useLoadOnMount`}, used by this hook.
 * @see {@link useLoadOnStale `useLoadOnStale`}, used by this hook.
 * @see {@link useLoadOnDelete `useLoadOnDelete`}, used by this hook.
 * @see {@link useWaterfallLoad `useWaterfallLoad`}, often used alongside this
 *   hook for SSR loading.
 */
export default function useAutoLoad(cacheKey, load) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  if (typeof load !== "function")
    throw new TypeError("Argument 2 `load` must be a function.");

  useCacheEntryPrunePrevention(cacheKey);

  const autoAbortLoad = useAutoAbortLoad(load);

  useLoadOnMount(cacheKey, autoAbortLoad);
  useLoadOnStale(cacheKey, autoAbortLoad);
  useLoadOnDelete(cacheKey, autoAbortLoad);

  return autoAbortLoad;
}

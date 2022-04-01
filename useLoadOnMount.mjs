// @ts-check

import React from "react";

import HYDRATION_TIME_MS from "./HYDRATION_TIME_MS.mjs";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import useCache from "./useCache.mjs";

/** @typedef {import("./Cache.mjs").default} Cache */

/**
 * React hook to automatically load a {@link Cache.store cache store} entry
 * after the component mounts or the {@link CacheContext cache context} or any
 * of the arguments change, except during the
 * {@link HYDRATION_TIME_MS hydration time} if the
 * {@link HydrationTimeStampContext hydration time stamp context} is populated
 * and the {@link Cache.store cache store} entry is already populated.
 * @param {import("./Cache.mjs").CacheKey} cacheKey Cache key.
 * @param {import("./types.mjs").Loader} load Memoized function that starts the
 *   loading.
 */
export default function useLoadOnMount(cacheKey, load) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  if (typeof load !== "function")
    throw new TypeError("Argument 2 `load` must be a function.");

  const cache = useCache();
  const hydrationTimeStamp = React.useContext(HydrationTimeStampContext);

  if (
    // Allowed to be undefined for apps that don’t provide this context.
    hydrationTimeStamp !== undefined &&
    typeof hydrationTimeStamp !== "number"
  )
    throw new TypeError("Hydration time stamp context value must be a number.");

  const startedRef = React.useRef(
    /**
     * @type {{
     *   cache: Cache,
     *   cacheKey: import("./Cache.mjs").CacheKey,
     *   load: import("./types.mjs").Loader
     * } | undefined}
     */ (undefined)
  );

  React.useEffect(() => {
    if (
      // Loading the same as currently specified wasn’t already started.
      !(
        startedRef.current &&
        startedRef.current.cache === cache &&
        startedRef.current.cacheKey === cacheKey &&
        startedRef.current.load === load
      ) &&
      // Waterfall loaded cache isn’t being hydrated.
      !(
        cacheKey in cache.store &&
        hydrationTimeStamp &&
        // Within the hydration time.
        performance.now() - hydrationTimeStamp < HYDRATION_TIME_MS
      )
    ) {
      startedRef.current = { cache, cacheKey, load };

      load();
    }
  }, [cache, cacheKey, hydrationTimeStamp, load]);
}

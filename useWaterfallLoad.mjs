// @ts-check

import React from "react";
import WaterfallRenderContext from "react-waterfall-render/WaterfallRenderContext.mjs";

import LoadingCacheValue from "./LoadingCacheValue.mjs";
import useCache from "./useCache.mjs";

/** @typedef {import("./useAutoLoad.mjs").default} useAutoLoad */
/** @typedef {import("react-waterfall-render/waterfallRender.mjs").default} waterfallRender */

/**
 * React hook to load a {@link Cache.store cache store} entry if the
 * {@link WaterfallRenderContext waterfall render context} is populated, i.e.
 * when {@link waterfallRender waterfall rendering} for either a server side
 * render or to preload components in a browser environment.
 * @param {import("./Cache.mjs").CacheKey} cacheKey Cache key.
 * @param {import("./types.mjs").Loader} load Memoized function that starts the
 *   loading.
 * @returns {boolean} Did loading start. If so, it’s efficient for the component
 *   to return `null` since this render will be discarded anyway for a re-render
 *   onces the loading ends.
 * @see {@link useAutoLoad `useAutoLoad`}, often used alongside this hook.
 */
export default function useWaterfallLoad(cacheKey, load) {
  if (typeof cacheKey !== "string")
    throw new TypeError("Argument 1 `cacheKey` must be a string.");

  if (typeof load !== "function")
    throw new TypeError("Argument 2 `load` must be a function.");

  const cache = useCache();
  const declareLoading = React.useContext(WaterfallRenderContext);

  if (declareLoading && !(cacheKey in cache.store)) {
    // Todo: First, check if already loading?
    const loadingCacheValue = load();

    if (!(loadingCacheValue instanceof LoadingCacheValue))
      throw new TypeError(
        "Argument 2 `load` must return a `LoadingCacheValue` instance."
      );

    declareLoading(loadingCacheValue.promise);

    return true;
  }

  return false;
}

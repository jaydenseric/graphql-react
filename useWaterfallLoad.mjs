import React from "react";
import WaterfallRenderContext from "react-waterfall-render/WaterfallRenderContext.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import useCache from "./useCache.mjs";

/**
 * A React hook to load a [cache]{@link Cache#store} entry if the
 * [waterfall render context](https://github.com/jaydenseric/react-waterfall-render#member-waterfallrendercontext)
 * is populated, i.e. when
 * [waterfall rendering](https://github.com/jaydenseric/react-waterfall-render#function-waterfallrender)
 * for either a server side render or to preload components in a browser
 * environment.
 * @kind function
 * @name useWaterfallLoad
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @returns {boolean} Did loading start. If so, it’s efficient for the component to return `null` since this render will be discarded anyway for a re-render onces the loading ends.
 * @see [`useAutoLoad`]{@link useAutoLoad}, often used alongside this hook.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useWaterfallLoad from "graphql-react/useWaterfallLoad.mjs";
 * ```
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

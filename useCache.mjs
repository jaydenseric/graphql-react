import React from "react";
import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";

/**
 * A React hook to get the [cache context]{@link CacheContext}.
 * @kind function
 * @name useCache
 * @returns {Cache} The cache.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useCache from "graphql-react/useCache.mjs";
 * ```
 */
export default function useCache() {
  const cache = React.useContext(CacheContext);

  React.useDebugValue(cache);

  if (cache === undefined) throw new TypeError("Cache context missing.");

  if (!(cache instanceof Cache))
    throw new TypeError("Cache context value must be a `Cache` instance.");

  return cache;
}

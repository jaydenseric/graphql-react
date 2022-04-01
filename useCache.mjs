// @ts-check

import React from "react";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";

/**
 * React hook to use the {@linkcode CacheContext}.
 * @returns {Cache} The cache.
 */
export default function useCache() {
  const cache = React.useContext(CacheContext);

  React.useDebugValue(cache);

  if (cache === undefined) throw new TypeError("Cache context missing.");

  if (!(cache instanceof Cache))
    throw new TypeError("Cache context value must be a `Cache` instance.");

  return cache;
}

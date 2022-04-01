// @ts-check

import React from "react";

import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";

/**
 * React hook to use the {@linkcode CacheContext}.
 * @returns {Loading} Loading.
 */
export default function useLoading() {
  const loading = React.useContext(LoadingContext);

  React.useDebugValue(loading);

  if (loading === undefined) throw new TypeError("Loading context missing.");

  if (!(loading instanceof Loading))
    throw new TypeError("Loading context value must be a `Loading` instance.");

  return loading;
}

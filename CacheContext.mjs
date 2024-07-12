// @ts-check

/** @import Cache from "./Cache.mjs" */

import React from "react";

/**
 * [React context](https://reactjs.org/docs/context.html) for a
 * {@linkcode Cache} instance.
 * @type {React.Context<Cache | undefined>}
 */
const CacheContext = React.createContext(
  /** @type {Cache | undefined} */ (undefined),
);

CacheContext.displayName = "CacheContext";

export default CacheContext;

// @ts-check

import React from "react";

/** @typedef {import("./Cache.mjs").default} Cache */

/**
 * [React context](https://reactjs.org/docs/context.html) for a
 * {@linkcode Cache} instance.
 * @type {React.Context<Cache | undefined>}
 */
const CacheContext = React.createContext(
  /** @type {Cache | undefined} */ (undefined)
);

CacheContext.displayName = "CacheContext";

export default CacheContext;

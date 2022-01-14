// @ts-check

import React from "react";

/** @typedef {import("./Loading.mjs").default} Loading */

/**
 * [React context](https://reactjs.org/docs/context.html) for a
 * {@linkcode Loading} instance.
 * @type {React.Context<Loading | undefined>}
 */
const LoadingContext = React.createContext(
  /** @type {Loading | undefined} */ (undefined)
);

LoadingContext.displayName = "LoadingContext";

export default LoadingContext;

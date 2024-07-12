// @ts-check

/** @import Loading from "./Loading.mjs" */

import React from "react";

/**
 * [React context](https://reactjs.org/docs/context.html) for a
 * {@linkcode Loading} instance.
 * @type {React.Context<Loading | undefined>}
 */
const LoadingContext = React.createContext(
  /** @type {Loading | undefined} */ (undefined),
);

LoadingContext.displayName = "LoadingContext";

export default LoadingContext;

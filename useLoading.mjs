import React from "react";
import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";

/**
 * A React hook to get the [loading context]{@link LoadingContext}.
 * @kind function
 * @name useLoading
 * @returns {Loading} Loading.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoading from "graphql-react/useLoading.mjs";
 * ```
 */
export default function useLoading() {
  const loading = React.useContext(LoadingContext);

  if (typeof process === "object" && process.env.NODE_ENV !== "production")
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue(loading);

  if (loading === undefined) throw new TypeError("Loading context missing.");

  if (!(loading instanceof Loading))
    throw new TypeError("Loading context value must be a `Loading` instance.");

  return loading;
}

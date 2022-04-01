// @ts-check

import React from "react";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";

/**
 * React component to provide all the React context required to fully enable
 * [`graphql-react`](https://npm.im/graphql-react) functionality:
 *
 * - {@linkcode HydrationTimeStampContext}
 * - {@linkcode CacheContext}
 * - {@linkcode LoadingContext}
 * @param {ProviderProps} props React component props.
 * @example
 * Provide a {@linkcode Cache} instance for an app:
 *
 * ```js
 * import Cache from "graphql-react/Cache.mjs";
 * import Provider from "graphql-react/Provider.mjs";
 * import React from "react";
 *
 * const cache = new Cache();
 *
 * function App({ children }) {
 *   return React.createElement(Provider, { cache }, children);
 * }
 * ```
 */
export default function Provider({ cache, children }) {
  const hydrationTimeStampRef = React.useRef(
    /** @type {DOMHighResTimeStamp | undefined} */ (undefined)
  );

  if (!hydrationTimeStampRef.current)
    hydrationTimeStampRef.current = performance.now();

  const loadingRef = React.useRef(
    /** @type {Loading | undefined} */ (undefined)
  );

  if (!loadingRef.current) loadingRef.current = new Loading();

  if (!(cache instanceof Cache))
    throw new TypeError("Prop `cache` must be a `Cache` instance.");

  return React.createElement(
    HydrationTimeStampContext.Provider,
    { value: hydrationTimeStampRef.current },
    React.createElement(
      CacheContext.Provider,
      { value: cache },
      React.createElement(
        LoadingContext.Provider,
        { value: loadingRef.current },
        children
      )
    )
  );
}

/**
 * {@linkcode Provider} React component props.
 * @typedef {object} ProviderProps
 * @prop {Cache} cache {@linkcode Cache} instance.
 * @prop {React.ReactNode} [children] React children.
 */

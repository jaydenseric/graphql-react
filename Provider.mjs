import React from 'react';
import jsxRuntime from 'react/jsx-runtime.js';
import Cache from './Cache.mjs';
import CacheContext from './CacheContext.mjs';
import HydrationTimeStampContext from './HydrationTimeStampContext.mjs';
import Loading from './Loading.mjs';
import LoadingContext from './LoadingContext.mjs';

const { jsx } = jsxRuntime;

/**
 * A React component to provide all the React context required to enable the
 * entire `graphql-react` API:
 *
 * - [Hydration time stamp context]{@link HydrationTimeStampContext}
 * - [Cache context]{@link CacheContext}
 * - [Loading context]{@link LoadingContext}
 * @kind function
 * @name Provider
 * @param {object} props Component props.
 * @param {Cache} props.cache [`Cache`]{@link Cache} instance.
 * @param {ReactNode} [props.children] React children.
 * @returns {ReactNode} React virtual DOM node.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import Provider from 'graphql-react/Provider.mjs';
 * ```
 * @example <caption>Provide a [`Cache`]{@link Cache} instance for an app.</caption>
 * ```jsx
 * import Cache from 'graphql-react/Cache.mjs';
 * import Provider from 'graphql-react/Provider.mjs';
 * import React from 'react';
 *
 * const cache = new Cache();
 *
 * const App = ({ children }) => <Provider cache={cache}>{children}</Provider>;
 * ```
 */
export default function Provider({ cache, children }) {
  const hydrationTimeStampRef = React.useRef();
  if (!hydrationTimeStampRef.current)
    hydrationTimeStampRef.current = performance.now();

  const loadingRef = React.useRef();
  if (!loadingRef.current) loadingRef.current = new Loading();

  if (!(cache instanceof Cache))
    throw new TypeError('Prop `cache` must be a `Cache` instance.');

  return jsx(HydrationTimeStampContext.Provider, {
    value: hydrationTimeStampRef.current,
    children: jsx(CacheContext.Provider, {
      value: cache,
      children: jsx(LoadingContext.Provider, {
        value: loadingRef.current,
        children,
      }),
    }),
  });
}

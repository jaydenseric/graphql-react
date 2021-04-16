'use strict';

const { useRef } = require('react');
const { jsx } = require('react/jsx-runtime');
const Cache = require('./Cache');
const CacheContext = require('./CacheContext');
const HydrationTimeStampContext = require('./HydrationTimeStampContext');
const Loading = require('./Loading');
const LoadingContext = require('./LoadingContext');

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
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { Provider } from 'graphql-react';
 * ```
 *
 * ```js
 * import Provider from 'graphql-react/public/Provider.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { Provider } = require('graphql-react');
 * ```
 *
 * ```js
 * const Provider = require('graphql-react/public/Provider');
 * ```
 * @example <caption>Provide a [`Cache`]{@link Cache} instance for an app.</caption>
 * ```jsx
 * import { Cache, Provider } from 'graphql-react';
 * import React from 'react';
 *
 * const cache = new Cache();
 *
 * const App = ({ children }) => <Provider cache={cache}>{children}</Provider>;
 * ```
 */
module.exports = function Provider({ cache, children }) {
  const hydrationTimeStampRef = useRef();
  if (!hydrationTimeStampRef.current)
    hydrationTimeStampRef.current = performance.now();

  const loadingRef = useRef();
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
};

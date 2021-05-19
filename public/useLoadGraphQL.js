'use strict';

const isObject = require('isobject/index.cjs.js');
const React = require('react');
const createArgErrorMessageProd = require('../private/createArgErrorMessageProd.js');
const LoadingCacheValue = require('./LoadingCacheValue.js');
const fetchGraphQL = require('./fetchGraphQL.js');
const useCache = require('./useCache.js');
const useLoading = require('./useLoading.js');

/**
 * A React hook to get a function for loading a GraphQL operation.
 * @kind function
 * @name useLoadGraphQL
 * @returns {LoadGraphQL} Loads a GraphQL operation.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useLoadGraphQL } from 'graphql-react';
 * ```
 *
 * ```js
 * import useLoadGraphQL from 'graphql-react/public/useLoadGraphQL.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useLoadGraphQL } = require('graphql-react');
 * ```
 *
 * ```js
 * const useLoadGraphQL = require('graphql-react/public/useLoadGraphQL.js');
 * ```
 */
module.exports = function useLoadGraphQL() {
  const cache = useCache();
  const loading = useLoading();

  return React.useCallback(
    (cacheKey, fetchUri, fetchOptions) => {
      if (typeof cacheKey !== 'string')
        throw new TypeError(
          typeof process === 'object' && process.env.NODE_ENV !== 'production'
            ? 'Argument 1 `cacheKey` must be a string.'
            : createArgErrorMessageProd(1)
        );

      if (typeof fetchUri !== 'string')
        throw new TypeError(
          typeof process === 'object' && process.env.NODE_ENV !== 'production'
            ? 'Argument 2 `fetchUri` must be a string.'
            : createArgErrorMessageProd(2)
        );

      if (!isObject(fetchOptions))
        throw new TypeError(
          typeof process === 'object' && process.env.NODE_ENV !== 'production'
            ? 'Argument 3 `fetchOptions` must be an object.'
            : createArgErrorMessageProd(3)
        );

      // Avoid mutating the input fetch options.
      const { signal, ...modifiedFetchOptions } = fetchOptions;
      const abortController = new AbortController();

      // Respect an existing abort controller signal.
      if (signal)
        signal.aborted
          ? // Signal already aborted, so immediately abort.
            abortController.abort()
          : // Signal not already aborted, so setup a listener to abort when it
            // does.
            signal.addEventListener(
              'abort',
              () => {
                abortController.abort();
              },
              {
                // Prevent a memory leak if the existing abort controller is
                // long lasting, or controls multiple things.
                once: true,
              }
            );

      modifiedFetchOptions.signal = abortController.signal;

      return new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        fetchGraphQL(fetchUri, modifiedFetchOptions),
        abortController
      );
    },
    [cache, loading]
  );
};

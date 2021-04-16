'use strict';

const { useContext, useDebugValue } = require('react');
const Loading = require('./Loading');
const LoadingContext = require('./LoadingContext');

/**
 * A React hook to get the [loading context]{@link LoadingContext}.
 * @kind function
 * @name useLoading
 * @returns {Loading} Loading.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useLoading } from 'graphql-react';
 * ```
 *
 * ```js
 * import useLoading from 'graphql-react/public/useLoading.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useLoading } = require('graphql-react');
 * ```
 *
 * ```js
 * const useLoading = require('graphql-react/public/useLoading');
 * ```
 */
module.exports = function useLoading() {
  const loading = useContext(LoadingContext);

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue(loading);

  if (loading === undefined) throw new TypeError('Loading context missing.');

  if (!(loading instanceof Loading))
    throw new TypeError('Loading context value must be a `Loading` instance.');

  return loading;
};

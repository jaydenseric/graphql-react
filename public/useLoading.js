'use strict';

const React = require('react');
const Loading = require('./Loading.js');
const LoadingContext = require('./LoadingContext.js');

/**
 * A React hook to get the [loading context]{@link LoadingContext}.
 * @kind function
 * @name useLoading
 * @returns {Loading} Loading.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoading from 'graphql-react/public/useLoading.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const useLoading = require('graphql-react/public/useLoading.js');
 * ```
 */
module.exports = function useLoading() {
  const loading = React.useContext(LoadingContext);

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue(loading);

  if (loading === undefined) throw new TypeError('Loading context missing.');

  if (!(loading instanceof Loading))
    throw new TypeError('Loading context value must be a `Loading` instance.');

  return loading;
};

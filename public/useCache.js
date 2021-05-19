'use strict';

const React = require('react');
const Cache = require('./Cache');
const CacheContext = require('./CacheContext');

/**
 * A React hook to get the [cache context]{@link CacheContext}.
 * @kind function
 * @name useCache
 * @returns {Cache} The cache.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useCache } from 'graphql-react';
 * ```
 *
 * ```js
 * import useCache from 'graphql-react/public/useCache.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useCache } = require('graphql-react');
 * ```
 *
 * ```js
 * const useCache = require('graphql-react/public/useCache.js');
 * ```
 */
module.exports = function useCache() {
  const cache = React.useContext(CacheContext);

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue(cache);

  if (cache === undefined) throw new TypeError('Cache context missing.');

  if (!(cache instanceof Cache))
    throw new TypeError('Cache context value must be a `Cache` instance.');

  return cache;
};

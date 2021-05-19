'use strict';

const React = require('react');
const createArgErrorMessageProd = require('../private/createArgErrorMessageProd.js');
const useForceUpdate = require('../private/useForceUpdate.js');
const useCache = require('./useCache.js');

/**
 * A React hook to get a [cache value]{@link CacheValue} using its
 * [cache key]{@link CacheKey}.
 * @kind function
 * @name useCacheEntry
 * @param {CacheKey} cacheKey Cache key.
 * @returns {CacheValue} Cache value, if present.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useCacheEntry } from 'graphql-react';
 * ```
 *
 * ```js
 * import useCacheEntry from 'graphql-react/public/useCacheEntry.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useCacheEntry } = require('graphql-react');
 * ```
 *
 * ```js
 * const useCacheEntry = require('graphql-react/public/useCacheEntry.js');
 * ```
 */
module.exports = function useCacheEntry(cacheKey) {
  if (typeof cacheKey !== 'string')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cacheKey` must be a string.'
        : createArgErrorMessageProd(1)
    );

  const cache = useCache();
  const forceUpdate = useForceUpdate();

  const onTriggerUpdate = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  React.useEffect(() => {
    const eventNameSet = `${cacheKey}/set`;
    const eventNameDelete = `${cacheKey}/delete`;

    cache.addEventListener(eventNameSet, onTriggerUpdate);
    cache.addEventListener(eventNameDelete, onTriggerUpdate);

    return () => {
      cache.removeEventListener(eventNameSet, onTriggerUpdate);
      cache.removeEventListener(eventNameDelete, onTriggerUpdate);
    };
  }, [cache, cacheKey, onTriggerUpdate]);

  const value = cache.store[cacheKey];

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue(value);

  return value;
};

'use strict';

const { useCallback, useDebugValue, useEffect } = require('react');
const createArgErrorMessageProd = require('../private/createArgErrorMessageProd');
const useForceUpdate = require('../private/useForceUpdate');
const useLoading = require('./useLoading');

/**
 * A React hook to get the [loading cache values]{@link LoadingCacheValue} for
 * a given [cache key]{@link CacheKey}.
 * @kind function
 * @name useLoadingEntry
 * @param {CacheKey} cacheKey Cache key.
 * @returns {Set<LoadingCacheValue>|undefined} Loading cache values, if present.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useLoadingEntry } from 'graphql-react';
 * ```
 *
 * ```js
 * import useLoadingEntry from 'graphql-react/public/useLoadingEntry.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useLoadingEntry } = require('graphql-react');
 * ```
 *
 * ```js
 * const useLoadingEntry = require('graphql-react/public/useLoadingEntry');
 * ```
 */
module.exports = function useLoadingEntry(cacheKey) {
  if (typeof cacheKey !== 'string')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cacheKey` must be a string.'
        : createArgErrorMessageProd(1)
    );

  const loading = useLoading();
  const forceUpdate = useForceUpdate();

  const onTriggerUpdate = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    const eventNameStart = `${cacheKey}/start`;
    const eventNameEnd = `${cacheKey}/end`;

    loading.addEventListener(eventNameStart, onTriggerUpdate);
    loading.addEventListener(eventNameEnd, onTriggerUpdate);

    return () => {
      loading.removeEventListener(eventNameStart, onTriggerUpdate);
      loading.removeEventListener(eventNameEnd, onTriggerUpdate);
    };
  }, [loading, cacheKey, onTriggerUpdate]);

  const value = loading.store[cacheKey];

  if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue(value);

  return value;
};

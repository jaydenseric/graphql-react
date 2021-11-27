'use strict';

const React = require('react');
const createArgErrorMessageProd = require('./createArgErrorMessageProd.js');
const useForceUpdate = require('./useForceUpdate.js');
const useLoading = require('./useLoading.js');

/**
 * A React hook to get the [loading cache values]{@link LoadingCacheValue} for
 * a given [cache key]{@link CacheKey}.
 * @kind function
 * @name useLoadingEntry
 * @param {CacheKey} cacheKey Cache key.
 * @returns {Set<LoadingCacheValue>|undefined} Loading cache values, if present.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useLoadingEntry from 'graphql-react/useLoadingEntry.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const useLoadingEntry = require('graphql-react/useLoadingEntry.js');
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

  const onTriggerUpdate = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  React.useEffect(() => {
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
    React.useDebugValue(value);

  return value;
};

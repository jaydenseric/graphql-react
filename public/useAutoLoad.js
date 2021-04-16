'use strict';

const createArgErrorMessageProd = require('../private/createArgErrorMessageProd');
const useAutoAbortLoad = require('./useAutoAbortLoad');
const useCacheEntryPrunePrevention = require('./useCacheEntryPrunePrevention');
const useLoadOnDelete = require('./useLoadOnDelete');
const useLoadOnMount = require('./useLoadOnMount');
const useLoadOnStale = require('./useLoadOnStale');

/**
 * A React hook to prevent a [cache]{@link Cache#store} entry from being pruned
 * while the component is mounted and automatically keep it loaded. Previous
 * loading that started via this hook aborts when new loading starts via this
 * hook, the hook arguments change, or the component unmounts.
 * @kind function
 * @name useAutoLoad
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @returns {Loader} Memoized [loader]{@link Loader} created from the `load` argument, that automatically aborts the last loading when the memoized function changes or the component unmounts.
 * @see [`useCacheEntryPrunePrevention`]{@link useCacheEntryPrunePrevention}, used by this hook.
 * @see [`useAutoAbortLoad`]{@link useAutoAbortLoad}, used by this hook.
 * @see [`useLoadOnMount`]{@link useLoadOnMount}, used by this hook.
 * @see [`useLoadOnStale`]{@link useLoadOnStale}, used by this hook.
 * @see [`useLoadOnDelete`]{@link useLoadOnDelete}, used by this hook.
 * @see [`useWaterfallLoad`]{@link useWaterfallLoad}, often used alongside this hook for SSR loading.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useAutoLoad } from 'graphql-react';
 * ```
 *
 * ```js
 * import useAutoLoad from 'graphql-react/public/useAutoLoad.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useAutoLoad } = require('graphql-react');
 * ```
 *
 * ```js
 * const useAutoLoad = require('graphql-react/public/useAutoLoad');
 * ```
 */
module.exports = function useAutoLoad(cacheKey, load) {
  if (typeof cacheKey !== 'string')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cacheKey` must be a string.'
        : createArgErrorMessageProd(1)
    );

  if (typeof load !== 'function')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 2 `load` must be a function.'
        : createArgErrorMessageProd(2)
    );

  useCacheEntryPrunePrevention(cacheKey);

  const autoAbortLoad = useAutoAbortLoad(load);

  useLoadOnMount(cacheKey, autoAbortLoad);
  useLoadOnStale(cacheKey, autoAbortLoad);
  useLoadOnDelete(cacheKey, autoAbortLoad);

  return autoAbortLoad;
};

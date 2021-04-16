'use strict';

const { useCallback, useEffect } = require('react');
const createArgErrorMessageProd = require('../private/createArgErrorMessageProd');
const useCache = require('./useCache');

/**
 * A React hook to load a [cache]{@link Cache#store} entry after it’s
 * [deleted]{@link Cache#event:delete}, if there isn’t loading for the
 * [cache key]{@link CacheKey} that started after.
 * @kind function
 * @name useLoadOnDelete
 * @param {CacheKey} cacheKey Cache key.
 * @param {Loader} load Memoized function that starts the loading.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useLoadOnDelete } from 'graphql-react';
 * ```
 *
 * ```js
 * import useLoadOnDelete from 'graphql-react/public/useLoadOnDelete.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useLoadOnDelete } = require('graphql-react');
 * ```
 *
 * ```js
 * const useLoadOnDelete = require('graphql-react/public/useLoadOnDelete');
 * ```
 */
module.exports = function useLoadOnDelete(cacheKey, load) {
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

  const cache = useCache();

  const onCacheEntryDelete = useCallback(() => {
    load();
  }, [load]);

  useEffect(() => {
    const eventNameDelete = `${cacheKey}/delete`;

    cache.addEventListener(eventNameDelete, onCacheEntryDelete);

    return () => {
      cache.removeEventListener(eventNameDelete, onCacheEntryDelete);
    };
  }, [cache, cacheKey, onCacheEntryDelete]);
};

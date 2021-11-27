'use strict';

const Cache = require('./Cache.js');
const createArgErrorMessageProd = require('./createArgErrorMessageProd.js');

/**
 * Sets a [cache]{@link Cache#store} entry.
 * @kind function
 * @name cacheEntrySet
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @param {CacheValue} cacheValue Cache value.
 * @fires Cache#event:set
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cacheEntrySet from 'graphql-react/cacheEntrySet.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const cacheEntrySet = require('graphql-react/cacheEntrySet.js');
 * ```
 */
module.exports = function cacheEntrySet(cache, cacheKey, cacheValue) {
  if (!(cache instanceof Cache))
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cache` must be a `Cache` instance.'
        : createArgErrorMessageProd(1)
    );

  if (typeof cacheKey !== 'string')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 2 `cacheKey` must be a string.'
        : createArgErrorMessageProd(2)
    );

  cache.store[cacheKey] = cacheValue;

  cache.dispatchEvent(
    new CustomEvent(`${cacheKey}/set`, {
      detail: {
        cacheValue,
      },
    })
  );
};

'use strict';

const createArgErrorMessageProd = require('../private/createArgErrorMessageProd.js');
const Cache = require('./Cache.js');
const cacheEntryStale = require('./cacheEntryStale.js');

/**
 * Stales [cache]{@link Cache#store} entries. Useful after a mutation.
 * @kind function
 * @name cacheStale
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches [cache keys]{@link CacheKey} to stale. By default all are matched.
 * @fires Cache#event:stale
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { cacheStale } from 'graphql-react';
 * ```
 *
 * ```js
 * import cacheStale from 'graphql-react/public/cacheStale.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { cacheStale } = require('graphql-react');
 * ```
 *
 * ```js
 * const cacheStale = require('graphql-react/public/cacheStale.js');
 * ```
 */
module.exports = function cacheStale(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cache` must be a `Cache` instance.'
        : createArgErrorMessageProd(1)
    );

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== 'function')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 2 `cacheKeyMatcher` must be a function.'
        : createArgErrorMessageProd(2)
    );

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryStale(cache, cacheKey);
};

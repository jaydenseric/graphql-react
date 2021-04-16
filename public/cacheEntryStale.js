'use strict';

const createArgErrorMessageProd = require('../private/createArgErrorMessageProd');
const Cache = require('./Cache');

/**
 * Stales a [cache]{@link Cache#store} entry, signalling it should probably be
 * reloaded.
 * @kind function
 * @name cacheEntryStale
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @fires Cache#event:stale
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { cacheEntryStale } from 'graphql-react';
 * ```
 *
 * ```js
 * import cacheEntryStale from 'graphql-react/public/cacheEntryStale.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { cacheEntryStale } = require('graphql-react');
 * ```
 *
 * ```js
 * const cacheEntryStale = require('graphql-react/public/cacheEntryStale');
 * ```
 */
module.exports = function cacheEntryStale(cache, cacheKey) {
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

  if (!(cacheKey in cache.store))
    throw new Error(`Cache key \`${cacheKey}\` isn’t in the store.`);

  cache.dispatchEvent(new CustomEvent(`${cacheKey}/stale`));
};

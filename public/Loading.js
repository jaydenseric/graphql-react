'use strict';

/**
 * Loading store.
 * @kind class
 * @name Loading
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { Loading } from 'graphql-react';
 * ```
 *
 * ```js
 * import Loading from 'graphql-react/public/Loading.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { Loading } = require('graphql-react');
 * ```
 *
 * ```js
 * const Loading = require('graphql-react/public/Loading.js');
 * ```
 * @example <caption>Construct a new instance.</caption>
 * ```js
 * const loading = new Loading();
 * ```
 */
module.exports = class Loading extends EventTarget {
  constructor() {
    super();

    /**
     * Loading store, keyed by [cache key]{@link CacheKey}. Multiple
     * [loading cache values]{@link LoadingCacheValue} for the same key are set
     * in the order they started.
     * @kind member
     * @name Loading#store
     * @type {object<CacheKey, Set<LoadingCacheValue>>}
     */
    this.store = {};
  }
};

/**
 * Signals the start of [loading a cache value]{@link LoadingCacheValue}. The
 * event name starts with the [cache key]{@link CacheKey}, followed by `/start`.
 * @kind event
 * @name Loading#event:start
 * @type {LoadingCacheValue}
 * @type {CustomEvent}
 * @prop {object} detail Event detail.
 * @prop {LoadingCacheValue} detail.loadingCacheValue Loading cache value that started.
 */

/**
 * Signals the end of [loading a cache value]{@link LoadingCacheValue}; either
 * the loading finished and the [cache value]{@link CacheValue} was set, the
 * loading was aborted, or there was an error. The event name starts with the
 * [cache key]{@link CacheKey}, followed by `/end`.
 * @kind event
 * @name Loading#event:end
 * @type {CustomEvent}
 * @prop {object} detail Event detail.
 * @prop {LoadingCacheValue} detail.loadingCacheValue Loading cache value that ended.
 */

'use strict';

// The full path is required because mitt has a package.json `module` field.
// When graphql-react is used in a webpack project (e.g. via Next.js), webpack
// swaps out the mitt `main` CJS file for the `module` ESM file, represented as
// an object with a `default` key because the ESM only has a default export.
// This would result in `mitt` being undefined instead of a function.
const mitt = require('mitt/dist/mitt');
const hashObject = require('./hashObject');
const graphqlFetchOptions = require('./private/graphqlFetchOptions');

/**
 * A lightweight GraphQL client that caches queries and mutations.
 * @kind class
 * @name GraphQL
 * @param {object} [options={}] Options.
 * @param {GraphQLCache} [options.cache={}] Cache to import; usually from a server side render.
 * @see [`reportCacheErrors`]{@link reportCacheErrors} to setup error reporting.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { GraphQL } from 'graphql-react';
 * ```
 *
 * ```js
 * import GraphQL from 'graphql-react/universal/GraphQL.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { GraphQL } = require('graphql-react');
 * ```
 *
 * ```js
 * const GraphQL = require('graphql-react/universal/GraphQL');
 * ```
 * @example <caption>Construct a GraphQL client.</caption>
 * ```js
 * import { GraphQL } from 'graphql-react';
 *
 * const graphql = new GraphQL();
 * ```
 */
module.exports = class GraphQL {
  constructor({ cache = {} } = {}) {
    const { on, off, emit } = mitt();

    /**
     * Adds an event listener.
     * @kind function
     * @name GraphQL#on
     * @param {string} type Event type.
     * @param {Function} handler Event handler.
     * @see [`reportCacheErrors`]{@link reportCacheErrors} can be used with this to setup error reporting.
     */
    this.on = on;

    /**
     * Removes an event listener.
     * @kind function
     * @name GraphQL#off
     * @param {string} type Event type.
     * @param {Function} handler Event handler.
     */
    this.off = off;

    /**
     * Emits an event with details to listeners.
     * @param {string} type Event type.
     * @param {*} [details] Event details.
     * @ignore
     */
    this.emit = emit;

    /**
     * Cache of loaded GraphQL operations. You probably don’t need to interact
     * with this unless you’re implementing a server side rendering framework.
     * @kind member
     * @name GraphQL#cache
     * @type {GraphQLCache}
     * @example <caption>Export cache as JSON.</caption>
     * ```js
     * const exportedCache = JSON.stringify(graphql.cache);
     * ```
     * @example <caption>Example cache JSON.</caption>
     * ```json
     * {
     *   "a1bCd2": {
     *     "data": {
     *       "viewer": {
     *         "name": "Jayden Seric"
     *       }
     *     }
     *   }
     * }
     * ```
     */
    this.cache = cache;

    /**
     * A map of loading [GraphQL operations]{@link GraphQLOperation}, listed
     * under their [GraphQL cache]{@link GraphQL#cache}
     * [key]{@link GraphQLCacheKey} in the order they were initiated. You
     * probably don’t need to interact with this unless you’re implementing a
     * server side rendering framework.
     * @kind member
     * @name GraphQL#operations
     * @type {object.<GraphQLCacheKey, Array<Promise<GraphQLCacheValue>>>}
     * @example <caption>How to await all loading [GraphQL operations]{@link GraphQL#operations} .</caption>
     * ```js
     * await Promise.all(Object.values(graphql.operations).flat());
     * ```
     */
    this.operations = {};
  }

  /**
   * Signals that [GraphQL cache]{@link GraphQL#cache} subscribers such as the
   * [`useGraphQL`]{@link useGraphQL} React hook should reload their GraphQL
   * operation.
   * @kind function
   * @name GraphQL#reload
   * @param {GraphQLCacheKey} [exceptCacheKey] A [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for cache to exempt from reloading.
   * @fires GraphQL#event:reload
   * @example <caption>Reloading the [GraphQL cache]{@link GraphQL#cache}.</caption>
   * ```js
   * graphql.reload();
   * ```
   */
  reload = (exceptCacheKey) => {
    this.emit('reload', { exceptCacheKey });
  };

  /**
   * Resets the [GraphQL cache]{@link GraphQL#cache}, useful when a user logs
   * out.
   * @kind function
   * @name GraphQL#reset
   * @param {GraphQLCacheKey} [exceptCacheKey] A [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for cache to exempt from deletion. Useful for resetting cache after a mutation, preserving the mutation cache.
   * @fires GraphQL#event:reset
   * @example <caption>Resetting the [GraphQL cache]{@link GraphQL#cache}.</caption>
   * ```js
   * graphql.reset();
   * ```
   */
  reset = (exceptCacheKey) => {
    let cacheKeys = Object.keys(this.cache);

    if (exceptCacheKey)
      cacheKeys = cacheKeys.filter((hash) => hash !== exceptCacheKey);

    cacheKeys.forEach((cacheKey) => delete this.cache[cacheKey]);

    // Emit cache updates after the entire cache has been updated, so logic in
    // listeners can assume cache for all queries is fresh and stable.
    this.emit('reset', { exceptCacheKey });
  };

  /**
   * Loads a GraphQL operation, visible in
   * [GraphQL operations]{@link GraphQL#operations}. Emits a
   * [`GraphQL`]{@link GraphQL} instance `fetch` event if an already loading
   * operation isn’t reused, and a `cache` event once it’s loaded into the
   * [GraphQL cache]{@link GraphQL#cache}.
   * @kind function
   * @name GraphQL#operate
   * @param {object} options Options.
   * @param {GraphQLOperation} options.operation GraphQL operation.
   * @param {GraphQLFetchOptionsOverride} [options.fetchOptionsOverride] Overrides default GraphQL operation [`fetch` options]{@link GraphQLFetchOptions}.
   * @param {GraphQLCacheKeyCreator} [options.cacheKeyCreator=hashObject] [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} creator for the operation.
   * @param {boolean} [options.reloadOnLoad=false] Should a [GraphQL reload]{@link GraphQL#reload} happen after the operation loads, excluding the loaded operation cache.
   * @param {boolean} [options.resetOnLoad=false] Should a [GraphQL reset]{@link GraphQL#reset} happen after the operation loads, excluding the loaded operation cache.
   * @returns {GraphQLOperationLoading} Loading GraphQL operation details.
   * @fires GraphQL#event:fetch
   * @fires GraphQL#event:cache
   */
  operate = ({
    operation,
    fetchOptionsOverride,
    cacheKeyCreator = hashObject,
    reloadOnLoad,
    resetOnLoad,
  }) => {
    if (typeof cacheKeyCreator !== 'function')
      throw new TypeError(
        'operate() option “cacheKeyCreator” must be a function.'
      );

    if (reloadOnLoad && resetOnLoad)
      throw new TypeError(
        'operate() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'
      );

    // The `fetch` global not being defined correctly results in a `fetchError`
    // within the cache value; not the `operate` method throwing an error.
    const fetcher =
      typeof fetch === 'function'
        ? fetch
        : () =>
            Promise.reject(
              new TypeError('Global fetch API or polyfill unavailable.')
            );

    // Create the fetch options.
    const fetchOptions = graphqlFetchOptions(operation);
    if (fetchOptionsOverride) fetchOptionsOverride(fetchOptions);
    const { url, ...options } = fetchOptions;

    // Create the cache key.
    const cacheKey = cacheKeyCreator(fetchOptions);

    // The `operations` property must be updated for sync code following this
    // `operate` method call, as well as async code using `cacheValuePromise`.
    let resolveOperationsUpdated;
    const operationsUpdatedPromise = new Promise((resolve) => {
      resolveOperationsUpdated = resolve;
    });

    // Start the fetch sync within the `operate` method rather than within the
    // `cacheValuePromise` chain to ensure fetches are sent in the order of
    // multiple `operate` method calls within sync code.
    const responsePromise = fetcher(url, options);

    let fetchResponse;

    const cacheValue = {};
    const cacheValuePromise = operationsUpdatedPromise.then(() =>
      responsePromise
        .then(
          (response) => {
            fetchResponse = response;

            if (!response.ok)
              cacheValue.httpError = {
                status: response.status,
                statusText: response.statusText,
              };

            return response.json().then(
              ({ errors, data }) => {
                // JSON parse ok.
                if (!errors && !data)
                  cacheValue.parseError = 'Malformed payload.';
                if (errors) cacheValue.graphQLErrors = errors;
                if (data) cacheValue.data = data;
              },
              ({ message }) => {
                // JSON parse error.
                cacheValue.parseError = message;
              }
            );
          },
          ({ message }) => {
            cacheValue.fetchError = message;
          }
        )
        .then(() => {
          // If there’s earlier GraphQL operation(s) loading for the same cache
          // key, wait for them to complete so the cache is updated and the
          // `cache` events are emitted in the order the operations were
          // initiated. This prevents a slow earlier operation from overwriting
          // the cache from a faster later operation.
          if (this.operations[cacheKey].length > 1) {
            const operationIndex = this.operations[cacheKey].indexOf(
              cacheValuePromise
            );

            if (operationIndex)
              // There are earlier GraphQL operations.
              return Promise.all(
                // The earlier GraphQL operations.
                this.operations[cacheKey].slice(0, operationIndex)
              );
          }
        })
        .then(() => {
          // The cache value promise should resolve after the cache has been
          // updated, it’s cleared from the map of loading GraphQL operations,
          // and the `cache` event has been emitted (in that order).

          // Update the cache.
          this.cache[cacheKey] = cacheValue;

          // Clear this operation from the map of loading GraphQL operations.
          this.operations[cacheKey].splice(
            // The `>>> 0` is a clever way to defend against `indexOf` returning
            // `-1` if the cache value promise is not in the array for some
            // unexpected reason. It leaves non-negative integers alone, but
            // converts `-1` into the largest possible unsigned 32-bit integer,
            // which happens to be the ECMAScript spec max length of an array;
            // resulting in a harmless splice.
            this.operations[cacheKey].indexOf(cacheValuePromise) >>> 0,
            1
          );

          // If there are no more operations loading for this cache key, delete
          // the empty array from the `operations` property.
          if (!this.operations[cacheKey].length)
            delete this.operations[cacheKey];

          // Emit the `cache` event.
          this.emit('cache', {
            cacheKey,
            cacheValue,

            // May be undefined if there was a fetch error.
            response: fetchResponse,
          });

          return cacheValue;
        })
    );

    // Add this operation to the map of loading GraphQL operations.
    if (!this.operations[cacheKey]) this.operations[cacheKey] = [];
    this.operations[cacheKey].push(cacheValuePromise);
    resolveOperationsUpdated();

    // Emit the `fetch` event after the `operations` property has been updated.
    this.emit('fetch', { cacheKey, cacheValuePromise });

    // A reload or reset happens after the cache is updated as a side effect.
    if (reloadOnLoad)
      cacheValuePromise.then(() => {
        this.reload(cacheKey);
      });
    else if (resetOnLoad)
      cacheValuePromise.then(() => {
        this.reset(cacheKey);
      });

    return {
      cacheKey,
      cacheValue: this.cache[cacheKey],
      cacheValuePromise,
    };
  };
};

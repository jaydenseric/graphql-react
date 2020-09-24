'use strict';

exports.GraphQL = require('./GraphQL');
exports.GraphQLContext = require('./GraphQLContext');
exports.GraphQLProvider = require('./GraphQLProvider');
exports.hashObject = require('./hashObject');
exports.reportCacheErrors = require('./reportCacheErrors');
exports.useGraphQL = require('./useGraphQL');

/**
 * A [GraphQL cache]{@link GraphQL#cache} map of
 * [GraphQL operation]{@link GraphQLOperation} results.
 * @kind typedef
 * @name GraphQLCache
 * @type {object.<GraphQLCacheKey, GraphQLCacheValue>}
 * @see [`GraphQL`]{@link GraphQL} constructor accepts this type for `options.cache`.
 * @see [`GraphQL`]{@link GraphQL} instance property [`cache`]{@link GraphQL#cache} is this type.
 */

/**
 * A [GraphQL cache]{@link GraphQLCache} key, derived from a hash of the
 * [`fetch` options]{@link GraphQLFetchOptions} of the
 * [GraphQL operation]{@link GraphQLOperation} that populated the
 * [value]{@link GraphQLCacheValue}.
 * @kind typedef
 * @name GraphQLCacheKey
 * @type {string}
 */

/**
 * [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} creator for
 * a [GraphQL operation]{@link GraphQLOperation}. It can either use the provided
 * [`fetch` options]{@link GraphQLFetchOptions} (e.g. derive a hash), or simply
 * return a hardcoded string.
 * @kind typedef
 * @name GraphQLCacheKeyCreator
 * @type {Function}
 * @param {GraphQLFetchOptions} options [GraphQL `fetch` options]{@link GraphQLFetchOptions} tailored to the [GraphQL operation]{@link GraphQLOperation}, e.g. if there are files to upload `options.body` will be a [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instance conforming to the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).
 * @see [`GraphQL`]{@link GraphQL} instance method [`operate`]{@link GraphQL#operate} accepts this type for `options.cacheKeyCreator`.
 * @see [`useGraphQL`]{@link useGraphQL} React hook accepts this type for `options.cacheKeyCreator`.
 */

/**
 * JSON serializable [GraphQL operation]{@link GraphQLOperation} result that
 * includes errors and data.
 * @kind typedef
 * @name GraphQLCacheValue
 * @type {object}
 * @prop {string} [fetchError] [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) error message.
 * @prop {HttpError} [httpError] [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) HTTP error.
 * @prop {string} [parseError] Parse error message.
 * @prop {Array<object>} [graphQLErrors] GraphQL response errors.
 * @prop {object} [data] GraphQL response data.
 */

/**
 * Signals that [GraphQL cache]{@link GraphQL#cache} subscribers such as the
 * [`useGraphQL`]{@link useGraphQL} React hook should reload their GraphQL
 * operation.
 * @kind event
 * @name GraphQL#event:reload
 * @type {object}
 * @prop {GraphQLCacheKey} [exceptCacheKey] A [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for cache to exempt from reloading.
 */

/**
 * Signals that the [GraphQL cache]{@link GraphQL#cache} has been reset.
 * @kind event
 * @name GraphQL#event:reset
 * @type {object}
 * @prop {GraphQLCacheKey} [exceptCacheKey] The [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for cache that was exempted from deletion.
 */

/**
 * Signals that a [GraphQL operation]{@link GraphQLOperation} is being fetched.
 * @kind event
 * @name GraphQL#event:fetch
 * @type {object}
 * @prop {GraphQLCacheKey} cacheKey The [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for the operation being fetched.
 * @prop {Promise<GraphQLCacheValue>} cacheValuePromise Resolves the loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
 */

/**
 * Signals that a [GraphQL operation]{@link GraphQLOperation} was fetched and
 * cached.
 * @kind event
 * @name GraphQL#event:cache
 * @type {object}
 * @prop {GraphQLCacheKey} cacheKey The [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for the operation that was cached.
 * @prop {GraphQLCacheValue} cacheValue The loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
 * @prop {Response} [response] The [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance; may be undefined if there was a fetch error.
 */

/**
 * GraphQL API URL and
 * [polyfillable `fetch` options](https://github.github.io/fetch/#options). The
 * `url` property gets extracted and the rest are used as
 * [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.
 * @kind typedef
 * @name GraphQLFetchOptions
 * @type {object}
 * @prop {string} url GraphQL API URL.
 * @prop {string|FormData} body HTTP request body.
 * @prop {object} headers HTTP request headers.
 * @prop {string} [credentials] Authentication credentials mode.
 * @see [`GraphQLFetchOptionsOverride` functions]{@link GraphQLFetchOptionsOverride} accept this type.
 */

/**
 * Overrides default [GraphQL `fetch` options]{@link GraphQLFetchOptions}.
 * Mutate the provided options object; there is no need to return it.
 * @kind typedef
 * @name GraphQLFetchOptionsOverride
 * @type {Function}
 * @param {GraphQLFetchOptions} options [GraphQL `fetch` options]{@link GraphQLFetchOptions} tailored to the [GraphQL operation]{@link GraphQLOperation}, e.g. if there are files to upload `options.body` will be a [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instance conforming to the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).
 * @see [`GraphQL`]{@link GraphQL} instance method [`operate`]{@link GraphQL#operate} accepts this type for `options.fetchOptionsOverride`.
 * @see [`useGraphQL`]{@link useGraphQL} React hook accepts this type for `options.fetchOptionsOverride`.
 * @example <caption>Setting [GraphQL `fetch` options]{@link GraphQLFetchOptions} for an imaginary API.</caption>
 * ```js
 * (options) => {
 *   options.url = 'https://api.example.com/graphql';
 *   options.credentials = 'include';
 * };
 * ```
 */

/**
 * A GraphQL operation. Additional properties may be used; all are sent to the
 * GraphQL server.
 * @kind typedef
 * @name GraphQLOperation
 * @type {object}
 * @prop {string} query GraphQL queries/mutations.
 * @prop {object} variables Variables used in the `query`.
 * @see [`GraphQL`]{@link GraphQL} instance method [`operate`]{@link GraphQL#operate} accepts this type for `options.operation`.
 * @see [`useGraphQL`]{@link useGraphQL} React hook accepts this type for `options.operation`.
 */

/**
 * A loading [GraphQL operation]{@link GraphQLOperation}.
 * @kind typedef
 * @name GraphQLOperationLoading
 * @type {object}
 * @prop {GraphQLCacheKey} cacheKey [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey}.
 * @prop {GraphQLCacheValue} [cacheValue] [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue} from the last identical query.
 * @prop {Promise<GraphQLCacheValue>} cacheValuePromise Resolves the loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
 * @see [`GraphQL`]{@link GraphQL} instance method [`operate`]{@link GraphQL#operate} returns this type.
 */

/**
 * The status of a [GraphQL operation]{@link GraphQLOperation} managed by the
 * [`useGraphQL`]{@link useGraphQL} React hook.
 * @kind typedef
 * @name GraphQLOperationStatus
 * @type {object}
 * @prop {Function} load Loads the current [GraphQL operation]{@link GraphQLOperation} on demand, updating the [GraphQL cache]{@link GraphQL#cache}.
 * @prop {boolean} loading Is the current [GraphQL operation]{@link GraphQLOperation} loading.
 * @prop {GraphQLCacheKey} cacheKey [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} for the current [GraphQL operation]{@link GraphQLOperation} and [GraphQL `fetch` options]{@link GraphQLFetchOptions}.
 * @prop {GraphQLCacheValue} cacheValue [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue} for the current [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey}.
 * @prop {GraphQLCacheValue} loadedCacheValue [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue} that was last loaded by this [`useGraphQL`]{@link useGraphQL} React hook; even if the [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} has since changed.
 * @see [`useGraphQL`]{@link useGraphQL} React hook returns this type.
 */

/**
 * [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) HTTP error.
 * @kind typedef
 * @name HttpError
 * @type {object}
 * @prop {number} status HTTP status code.
 * @prop {string} statusText HTTP status text.
 */

/**
 * A React virtual DOM node; anything that can be rendered.
 * @kind typedef
 * @name ReactNode
 * @type {undefined|null|boolean|number|string|React.Element|Array<ReactNode>}
 */

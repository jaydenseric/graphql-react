export { GraphQL } from './graphql'
export { Provider, Consumer, Query } from './components'
export { preload } from './preload'

/**
 * Loading query details.
 * @kind typedef
 * @name ActiveQuery
 * @type {Object}
 * @prop {string} fetchOptionsHash [fetch options]{@link FetchOptions} hash.
 * @prop {RequestCache} [cache] Results from the last identical request.
 * @prop {Promise<RequestCache>} request A promise that resolves fresh [request cache]{@link RequestCache}.
 */

/**
 * A cache update listener callback.
 * @kind typedef
 * @name CacheUpdateCallback
 * @type {function}
 * @param {RequestCache} requestCache Request cache.
 * @ignore
 */

/**
 * [Polyfillable fetch options](https://github.github.io/fetch/#options) for a
 * GraphQL request.
 * @kind typedef
 * @name FetchOptions
 * @type {Object}
 * @prop {string} url A GraphQL API URL.
 * @prop {string|FormData} body HTTP request body.
 * @prop {Object} headers HTTP request headers.
 * @prop {string} [credentials] Authentication credentials mode.
 */

/**
 * Overrides default GraphQL request [fetch options]{@link FetchOptions}. Modify
 * the provided options object without a return.
 * @kind typedef
 * @name FetchOptionsOverride
 * @type {function}
 * @param {FetchOptions} fetchOptions Default GraphQL request fetch options.
 * @param {GraphQLOperation} [operation] GraphQL operation.
 * @example <caption>Setting [fetch options]{@link FetchOptions} for an example API.</caption>
 * ```js
 * options => {
 *   options.url = 'https://api.example.com/graphql'
 *   options.credentials = 'include'
 * }
 * ```
 */

/**
 * A GraphQL operation. Additional properties may be used; all are sent
 * to the GraphQL server.
 * @kind typedef
 * @name GraphQLOperation
 * @type {Object}
 * @prop {string} query GraphQL queries or mutations.
 * @prop {Object} variables Variables used by the query.
 */

/**
 * Fetch HTTP error.
 * @kind typedef
 * @name HttpError
 * @type {Object}
 * @prop {number} status HTTP status code.
 * @prop {string} statusText HTTP status text.
 */

/**
 * JSON serializable result of a GraphQL request (including all errors and data)
 * suitable for caching.
 * @kind typedef
 * @name RequestCache
 * @type {Object}
 * @prop {string} [fetchError] Fetch error message.
 * @prop {HttpError} [httpError] Fetch response HTTP error.
 * @prop {string} [parseError] Parse error message.
 * @prop {Object} [graphQLErrors] GraphQL response errors.
 * @prop {Object} [data] GraphQL response data.
 */

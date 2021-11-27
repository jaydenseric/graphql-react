'use strict';

/**
 * A unique key to access a [cache value]{@link CacheValue}.
 * @kind typedef
 * @name CacheKey
 * @type {string}
 */

/**
 * A [cache]{@link Cache#store} value. If server side rendering, it should be
 * JSON serializable for client hydration. It should contain information about
 * any errors that occurred during loading so they can be rendered, and if
 * server side rendering, be hydrated on the client.
 * @kind typedef
 * @name CacheValue
 * @type {*}
 */

/**
 * Matches a [cache key]{@link CacheKey} against a custom condition.
 * @kind typedef
 * @name CacheKeyMatcher
 * @type {Function}
 * @param {CacheKey} cacheKey Cache key.
 * @returns {boolean} Does the [cache key]{@link CacheKey} match the custom condition.
 */

/**
 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
 * options, called `init` in official specs.
 * @kind typedef
 * @name FetchOptions
 * @type {object}
 * @see [MDN `fetch` parameters docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @see [Polyfillable `fetch` options](https://github.github.io/fetch/#options). Don’t use other options if `fetch` is polyfilled for Node.js or legacy browsers.
 */

/**
 * A GraphQL operation. Additional properties may be used; all are sent to the
 * GraphQL server.
 * @kind typedef
 * @name GraphQLOperation
 * @type {object}
 * @prop {string} query GraphQL queries or mutations.
 * @prop {object} [variables] Variables used in the `query`.
 */

/**
 * A GraphQL result.
 * @kind typedef
 * @name GraphQLResult
 * @type {object}
 * @prop {object} [data] GraphQL response data.
 * @prop {Array<GraphQLResultError>} [errors] GraphQL response errors from the server, along with any loading errors added on the client.
 * @see [GraphQL spec for a response](https://spec.graphql.org/June2018/#sec-Response).
 */

/**
 * A GraphQL result error; either created by the GraphQL server, or by whatever
 * loaded the GraphQL on the client (e.g. [`fetchGraphQL`]{@link fetchGraphQL}).
 * @kind typedef
 * @name GraphQLResultError
 * @type {object}
 * @prop {object} message Error message.
 * @prop {Array<{line: number, column: number}>} [locations] GraphQL query locations related to the error.
 * @prop {Array<string>} [path] [GraphQL result]{@link GraphQLResult} `data` field path related to the error.
 * @prop {object} [extensions] Custom error data. If the error was created on the client and not the GraphQL server, this property should be present and contain at least `client: true`, although `code` and error specific properties may be present.
 * @see [GraphQL spec for response errors](https://spec.graphql.org/June2018/#sec-Errors).
 */

/**
 * Milliseconds since the
 * [performance time origin](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin)
 * (when the current JavaScript environment started running).
 * @kind typedef
 * @name HighResTimeStamp
 * @type {number}
 * @see [MDN `DOMHighResTimeStamp` docs](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp).
 */

/**
 * Starts [loading a cache value]{@link LoadingCacheValue}.
 * @kind typedef
 * @name Loader
 * @type {Function}
 * @returns {LoadingCacheValue} The loading cache value.
 */

/**
 * Loads a GraphQL operation, using the [GraphQL fetcher]{@link fetchGraphQL}.
 * @kind typedef
 * @name LoadGraphQL
 * @type {Loader}
 * @param {CacheKey} cacheKey Cache key to store the loading result under.
 * @param {string} fetchUri [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) URI.
 * @param {FetchOptions} fetchOptions [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) options.
 * @returns {LoadingCacheValue} The loading cache value.
 */

/**
 * A React virtual DOM node; anything that can be rendered.
 * @kind typedef
 * @name ReactNode
 * @type {undefined|null|boolean|number|string|React.Element|Array<ReactNode>}
 */

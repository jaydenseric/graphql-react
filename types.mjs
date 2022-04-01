// @ts-check

/** @typedef {import("./Cache.mjs").CacheKey} CacheKey */
/** @typedef {import("./fetchGraphQL.mjs").default} fetchGraphQL */
/** @typedef {import("./LoadingCacheValue.mjs").default} LoadingCacheValue */

// Prevent a TypeScript error when importing this module in a JSDoc type.
export {};

// This module contains types that aren’t specific to a single module.

/**
 * Matches a {@link CacheKey cache key} against a custom condition.
 * @callback CacheKeyMatcher
 * @param {CacheKey} cacheKey Cache key.
 * @returns {boolean} Does the `cacheKey` match the custom condition.
 */

/**
 * A GraphQL operation. Additional properties may be used; all are sent to the
 * GraphQL server.
 * @typedef {object} GraphQLOperation
 * @prop {string} query GraphQL queries or mutations.
 * @prop {Record<string, unknown>} [variables] Variables used in the GraphQL
 *   queries or mutations.
 */

/**
 * A GraphQL result.
 * @see [GraphQL spec for a response](https://spec.graphql.org/October2021/#sec-Response).
 * @template [ErrorTypes=GraphQLResultError] Possible error types.
 * @typedef {object} GraphQLResult
 * @prop {Response} [response] The GraphQL server response. Non-enumerable to
 *   prevent it from serializing to JSON when sending SSR cache to the client
 *   for hydration.
 * @prop {Array<ErrorTypes>} [errors] GraphQL errors from the server, along with
 *   any loading errors added on the client.
 * @prop {Record<string, unknown> | null} [data] GraphQL data.
 */

/**
 * A {@link GraphQLResult.errors GraphQL result error}.
 * @see [GraphQL spec for response errors](https://spec.graphql.org/October2021/#sec-Errors).
 * @template {Record<string, unknown>} [Extensions=Record<string, unknown>]
 *   Extensions to a standard GraphQL error.
 * @typedef {object} GraphQLResultError
 * @prop {string} message Error message.
 * @prop {Array<{ line: number; column: number }>} [locations] GraphQL query
 *   locations related to the error.
 * @prop {Array<string | number>} [path] GraphQL result
 *   {@link GraphQLResult.data `data`} property path related to the error.
 * @prop {Extensions} [extensions] Extensions to a standard GraphQL error.
 */

/**
 * A {@link GraphQLResult GraphQL result} loading error generated on the client,
 * not the GraphQL server.
 * @template {string} Code Error code.
 * @template {Record<string, unknown>} [Extensions={}] Error specific details.
 * @typedef {object} GraphQLResultErrorLoading
 * @prop {string} message Error message.
 * @prop {GraphQLResultErrorLoadingMeta<Code> & Extensions} extensions Error
 *   specific details.
 */

/**
 * @template {string} Code Error code.
 * @typedef {object} GraphQLResultErrorLoadingMeta
 * @prop {true} client Error was generated on the client, not the GraphQL
 *   server.
 * @prop {Code} code Error code.
 */

/**
 * {@link GraphQLResultError GraphQL error} that the GraphQL request had a fetch
 * error, e.g. the `fetch` global isn’t defined, or the network is offline.
 * @typedef {GraphQLResultErrorLoading<
 *   "FETCH_ERROR",
 *   GraphQLResultErrorLoadingFetchDetails
 * >} GraphQLResultErrorLoadingFetch
 */

/**
 * @typedef {object} GraphQLResultErrorLoadingFetchDetails
 * @prop {string} fetchErrorMessage Fetch error message.
 */

/**
 * {@link GraphQLResultError GraphQL error} that the GraphQL response had an
 * error HTTP status.
 * @typedef {GraphQLResultErrorLoading<
 *   "RESPONSE_HTTP_STATUS",
 *   GraphQLResultErrorResponseHttpStatusDetails
 * >} GraphQLResultErrorResponseHttpStatus
 */

/**
 * @typedef {object} GraphQLResultErrorResponseHttpStatusDetails
 * @prop {number} statusCode HTTP status code in the error range.
 * @prop {string} statusText HTTP status text.
 */

/**
 * {@link GraphQLResultError GraphQL error} that the GraphQL response JSON had a
 * parse error.
 * @typedef {GraphQLResultErrorLoading<
 *   "RESPONSE_JSON_PARSE_ERROR",
 *   GraphQLResultErrorResponseJsonParseDetails
 * >} GraphQLResultErrorResponseJsonParse
 */

/**
 * @typedef {object} GraphQLResultErrorResponseJsonParseDetails
 * @prop {string} jsonParseErrorMessage JSON parse error message.
 */

/**
 * {@link GraphQLResultError GraphQL error} that the GraphQL response JSON was
 * malformed because it wasn’t an object, was missing an `errors` or `data`
 * property, the `errors` property wasn’t an array, or the `data` property
 * wasn’t an object or `null`.
 * @typedef {GraphQLResultErrorLoading<
 *   "RESPONSE_MALFORMED"
 * >} GraphQLResultErrorResponseMalformed
 */

/**
 * Starts {@link LoadingCacheValue loading a cache value}.
 * @callback Loader
 * @returns {LoadingCacheValue} The loading cache value.
 */

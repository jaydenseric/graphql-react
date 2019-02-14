/**
 * A [`GraphQL`]{@link GraphQL} `cache` event handler that reports
 * [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API), HTTP, parse
 * and GraphQL errors via `console.log()`. In a browser environment the grouped
 * error details are expandable.
 * @kind function
 * @name reportCacheErrors
 * @param {Object} data [`GraphQL`]{@link GraphQL} `cache` event data.
 * @param {GraphQLCacheKey} data.cacheKey [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey}.
 * @param {GraphQLCacheKey} data.cacheValue [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue}.
 * @example <caption>[`GraphQL`]{@link GraphQL} initialized to report cache errors.</caption>
 * ```js
 * import { GraphQL, reportCacheErrors } from 'graphql-react'
 *
 * const graphql = new GraphQL()
 * graphql.on('cache', reportCacheErrors)
 * ```
 */
export const reportCacheErrors = ({
  cacheKey,
  cacheValue: { fetchError, httpError, parseError, graphQLErrors }
}) => {
  if (fetchError || httpError || parseError || graphQLErrors) {
    // eslint-disable-next-line no-console
    console.groupCollapsed(`GraphQL cache errors for key “${cacheKey}”:`)

    if (fetchError) {
      // eslint-disable-next-line no-console
      console.groupCollapsed('Fetch:')

      // eslint-disable-next-line no-console
      console.log(fetchError)

      // eslint-disable-next-line no-console
      console.groupEnd()
    }

    if (httpError) {
      // eslint-disable-next-line no-console
      console.groupCollapsed('HTTP:')

      // eslint-disable-next-line no-console
      console.log(`Status: ${httpError.status}`)

      // eslint-disable-next-line no-console
      console.log(`Text: ${httpError.statusText}`)

      // eslint-disable-next-line no-console
      console.groupEnd()
    }

    if (parseError) {
      // eslint-disable-next-line no-console
      console.groupCollapsed('Parse:')

      // eslint-disable-next-line no-console
      console.log(parseError)

      // eslint-disable-next-line no-console
      console.groupEnd()
    }

    if (graphQLErrors) {
      // eslint-disable-next-line no-console
      console.groupCollapsed('GraphQL:')

      graphQLErrors.forEach(({ message }) =>
        // eslint-disable-next-line no-console
        console.log(message)
      )

      // eslint-disable-next-line no-console
      console.groupEnd()
    }

    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

'use strict';

/**
 * A [`GraphQL`]{@link GraphQL} [`cache`]{@link GraphQL#event:cache} event
 * handler that reports [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API),
 * HTTP, parse and GraphQL errors via `console.log()`. In a browser environment
 * the grouped error details are expandable.
 * @kind function
 * @name reportCacheErrors
 * @param {GraphQL#event:cache} data [`GraphQL`]{@link GraphQL} [`cache`]{@link GraphQL#event:cache} event data.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { reportCacheErrors } from 'graphql-react';
 * ```
 *
 * ```js
 * import reportCacheErrors from 'graphql-react/public/reportCacheErrors.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { reportCacheErrors } = require('graphql-react');
 * ```
 *
 * ```js
 * const reportCacheErrors = require('graphql-react/public/reportCacheErrors');
 * ```
 * @example <caption>[`GraphQL`]{@link GraphQL} initialized to report cache errors.</caption>
 * ```js
 * import { GraphQL, reportCacheErrors } from 'graphql-react';
 *
 * const graphql = new GraphQL();
 * graphql.on('cache', reportCacheErrors);
 * ```
 */
module.exports = function reportCacheErrors({
  cacheKey,
  cacheValue: { fetchError, httpError, parseError, graphQLErrors },
}) {
  if (fetchError || httpError || parseError || graphQLErrors) {
    console.groupCollapsed(`GraphQL cache errors for key “${cacheKey}”:`);

    if (fetchError) {
      console.groupCollapsed('Fetch:');

      // eslint-disable-next-line no-console
      console.log(fetchError);

      console.groupEnd();
    }

    if (httpError) {
      console.groupCollapsed('HTTP:');

      // eslint-disable-next-line no-console
      console.log(`Status: ${httpError.status}`);

      // eslint-disable-next-line no-console
      console.log(`Text: ${httpError.statusText}`);

      console.groupEnd();
    }

    if (parseError) {
      console.groupCollapsed('Parse:');

      // eslint-disable-next-line no-console
      console.log(parseError);

      console.groupEnd();
    }

    if (graphQLErrors) {
      console.groupCollapsed('GraphQL:');

      graphQLErrors.forEach(({ message }) =>
        // eslint-disable-next-line no-console
        console.log(message)
      );

      console.groupEnd();
    }

    console.groupEnd();
  }
};

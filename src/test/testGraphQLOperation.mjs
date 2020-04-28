import { deepStrictEqual, strictEqual } from 'assert';
import { GraphQL } from '../universal/index.mjs';
import promisifyEvent from './promisifyEvent.js';

/**
 * Tests [`GraphQL.operate()`]{@link GraphQL#operate} under certain conditions.
 * @param {object} options Options.
 * @param {number} options.port GraphQL server port.
 * @param {GraphQLOperation} [options.operation] [GraphQL operation]{@link GraphQLOperation}.
 * @param {boolean} [options.resetOnLoad] Should the [GraphQL cache]{@link GraphQL#cache} reset once the query loads.
 * @param {GraphQLCache} [options.initialGraphQLCache] Initial [GraphQL cache]{@link GraphQL#cache}.
 * @param {GraphQL} [options.graphql] [`GraphQL`]{@link GraphQL} instance.
 * @param {GraphQLCacheValue} options.expectedResolvedCacheValue Expected [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue}.
 * @param {boolean} [options.responseExpected=true] Is a response expected from the fetch.
 * @param {Function} [options.callback] Callback that accepts result metadata.
 * @returns {Promise} Resolves once the test is complete.
 * @ignore
 */
export default async function testGraphQLOperation({
  port,
  operation = { query: '{ echo }' },
  resetOnLoad,
  initialGraphQLCache,
  graphql = new GraphQL({
    cache: {
      // Spread so that cache updates don’t mutate the original object.
      ...initialGraphQLCache,
    },
  }),
  expectedResolvedCacheValue,
  responseExpected = true,
  callback,
}) {
  const fetchEvent = promisifyEvent(graphql, 'fetch');
  const cacheEvent = promisifyEvent(graphql, 'cache');

  if (resetOnLoad) var resetEvent = promisifyEvent(graphql, 'reset');

  const { cacheKey, cacheValue, cacheValuePromise } = graphql.operate({
    fetchOptionsOverride(options) {
      options.url = `http://localhost:${port}`;
    },
    resetOnLoad,
    operation,
  });

  strictEqual(typeof cacheKey, 'string');
  deepStrictEqual(
    cacheValue,
    initialGraphQLCache ? initialGraphQLCache[cacheKey] : undefined,
    'Initial cache value'
  );
  strictEqual(cacheKey in graphql.operations, true);
  strictEqual(cacheValuePromise instanceof Promise, true);
  strictEqual(cacheValuePromise, graphql.operations[cacheKey]);

  const cacheValueResolved = await graphql.operations[cacheKey];

  strictEqual(cacheKey in graphql.operations, false);
  deepStrictEqual(cacheValueResolved, expectedResolvedCacheValue);

  const fetchEventData = await fetchEvent;

  strictEqual(typeof fetchEventData, 'object');
  strictEqual(fetchEventData.cacheKey, cacheKey);
  strictEqual(fetchEventData.cacheValuePromise, cacheValuePromise);

  const cacheEventData = await cacheEvent;

  strictEqual(typeof cacheEventData, 'object');
  strictEqual(cacheEventData.cacheKey, cacheKey);
  deepStrictEqual(cacheEventData.cacheValue, expectedResolvedCacheValue);

  responseExpected
    ? strictEqual(cacheEventData.response instanceof Response, true)
    : strictEqual(cacheEventData.response, undefined);

  if (resetEvent) {
    const resetEventData = await resetEvent;
    strictEqual(resetEventData.exceptCacheKey, cacheKey);
  }

  deepStrictEqual(graphql.cache, {
    // If the cache was reset after loading, the only entry should be the
    // last query. Otherwise, the new cache value should be merged into the
    // initial GraphQL cache.
    ...(resetOnLoad ? {} : initialGraphQLCache),
    [cacheKey]: expectedResolvedCacheValue,
  });

  if (callback) callback({ cacheKey });
}

'use strict';

const { deepStrictEqual, strictEqual } = require('assert');
const GraphQL = require('../universal/GraphQL');
const promisifyEvent = require('./promisifyEvent');

/**
 * Tests [`GraphQL.operate()`]{@link GraphQL#operate} under certain conditions.
 * @param {object} options Options.
 * @param {number} options.port GraphQL server port.
 * @param {GraphQLOperation} [options.operation] [GraphQL operation]{@link GraphQLOperation}.
 * @param {boolean} [options.resetOnLoad] Should the [GraphQL cache]{@link GraphQL#cache} reset once the query loads.
 * @param {boolean} [options.reloadOnLoad] Should the [GraphQL cache]{@link GraphQL#cache} reload once the query loads.
 * @param {GraphQLCacheKeyCreator} [options.cacheKeyCreator] [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} creator for the operation.
 * @param {GraphQLCache} [options.initialGraphQLCache] Initial [GraphQL cache]{@link GraphQL#cache}.
 * @param {GraphQL} [options.graphql] [`GraphQL`]{@link GraphQL} instance.
 * @param {GraphQLCacheValue} options.expectedResolvedCacheValue Expected [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue}.
 * @param {boolean} [options.responseExpected=true] Is a response expected from the fetch.
 * @param {Function} [options.callback] Callback that accepts result metadata.
 * @returns {Promise} Resolves once the test is complete.
 * @ignore
 */
module.exports = async function testGraphQLOperation({
  port,
  operation = { query: '{ echo }' },
  resetOnLoad,
  reloadOnLoad,
  cacheKeyCreator,
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
  if (reloadOnLoad) var reloadEvent = promisifyEvent(graphql, 'reload');

  const { cacheKey, cacheValue, cacheValuePromise } = graphql.operate({
    fetchOptionsOverride(options) {
      options.url = `http://localhost:${port}`;
    },
    cacheKeyCreator,
    resetOnLoad,
    reloadOnLoad,
    operation,
  });

  strictEqual(typeof cacheKey, 'string');
  deepStrictEqual(
    cacheValue,
    initialGraphQLCache ? initialGraphQLCache[cacheKey] : undefined
  );
  strictEqual(cacheValuePromise instanceof Promise, true);
  strictEqual(cacheKey in graphql.operations, true);
  strictEqual(graphql.operations[cacheKey], cacheValuePromise);

  const fetchEventData = await fetchEvent;

  strictEqual(typeof fetchEventData, 'object');
  strictEqual(fetchEventData.cacheKey, cacheKey);
  strictEqual(fetchEventData.cacheValuePromise, cacheValuePromise);

  const cacheEventData = await cacheEvent;

  strictEqual(typeof cacheEventData, 'object');
  strictEqual(cacheEventData.cacheKey, cacheKey);
  deepStrictEqual(cacheEventData.cacheValue, expectedResolvedCacheValue);

  const cacheValueResolved = await cacheValuePromise;

  strictEqual(cacheKey in graphql.operations, false);
  deepStrictEqual(cacheValueResolved, expectedResolvedCacheValue);

  responseExpected
    ? strictEqual(cacheEventData.response instanceof Response, true)
    : strictEqual(cacheEventData.response, undefined);

  if (resetEvent) {
    const resetEventData = await resetEvent;
    strictEqual(resetEventData.exceptCacheKey, cacheKey);
  }

  if (reloadEvent) {
    const reloadEventData = await reloadEvent;
    strictEqual(reloadEventData.exceptCacheKey, cacheKey);
  }

  deepStrictEqual(graphql.cache, {
    // If the cache was reset after loading, the only entry should be the
    // last query. Otherwise, the new cache value should be merged into the
    // initial GraphQL cache.
    ...(resetOnLoad ? {} : initialGraphQLCache),
    [cacheKey]: expectedResolvedCacheValue,
  });

  if (callback) callback({ cacheKey });
};

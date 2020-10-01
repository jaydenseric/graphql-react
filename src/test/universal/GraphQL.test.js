'use strict';

const {
  deepStrictEqual,
  strictEqual,
  throws,
  notStrictEqual,
} = require('assert');
const { GraphQLInt } = require('graphql');
const Koa = require('koa');
const { default: fetch, Response } = require('node-fetch');
const revertableGlobals = require('revertable-globals');
const GraphQL = require('../../universal/GraphQL');
const createGraphQLKoaApp = require('../createGraphQLKoaApp');
const listen = require('../listen');
const promisifyEvent = require('../promisifyEvent');
const testGraphQLOperation = require('../testGraphQLOperation');

module.exports = (tests) => {
  tests.add('`GraphQL` option `cache`', () => {
    const cache = {
      abcdefg: {
        data: {
          echo: 'hello',
        },
      },
    };

    const graphql = new GraphQL({ cache });

    deepStrictEqual(graphql.cache, cache);
  });

  tests.add(
    '`GraphQL` method `operate` without and with initial cache',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(createGraphQLKoaApp());

        try {
          let hash;

          const expectedResolvedCacheValue = {
            data: {
              echo: 'hello',
            },
          };

          // Without initial cache.
          await testGraphQLOperation({
            port,
            expectedResolvedCacheValue,
            callback({ cacheKey }) {
              hash = cacheKey;
            },
          });

          // With initial cache.
          await testGraphQLOperation({
            port,
            initialGraphQLCache: {
              [hash]: expectedResolvedCacheValue,
            },
            expectedResolvedCacheValue,
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with option `cacheKeyCreator`, without and with initial cache',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(createGraphQLKoaApp());

        try {
          const cacheKey = 'a';
          const expectedResolvedCacheValue = { data: { echo: 'hello' } };

          let hash;

          // Without initial cache.
          await testGraphQLOperation({
            port,
            cacheKeyCreator: () => cacheKey,
            expectedResolvedCacheValue,
            callback({ cacheKey }) {
              hash = cacheKey;
            },
          });

          strictEqual(hash, cacheKey);

          // With initial cache.
          await testGraphQLOperation({
            port,
            cacheKeyCreator: () => 'a',
            initialGraphQLCache: {
              [hash]: expectedResolvedCacheValue,
            },
            expectedResolvedCacheValue,
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with global `fetch` unavailable',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        await testGraphQLOperation({
          port,
          expectedResolvedCacheValue: {
            fetchError: 'Global fetch API or polyfill unavailable.',
          },
          responseExpected: false,
        });
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with HTTP and parse errors',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(
          new Koa().use(async (ctx, next) => {
            ctx.response.status = 404;
            ctx.response.type = 'text/plain';
            ctx.response.body = 'Not found.';
            await next();
          })
        );

        try {
          await testGraphQLOperation({
            port,
            expectedResolvedCacheValue: {
              httpError: {
                status: 404,
                statusText: 'Not Found',
              },
              parseError: 'Unexpected token N in JSON at position 0',
            },
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add('`GraphQL` method `operate` with parse error', async () => {
    const revertGlobals = revertableGlobals({ fetch, Response });

    try {
      const { port, close } = await listen(
        new Koa().use(async (ctx, next) => {
          ctx.response.status = 200;
          ctx.response.type = 'text';
          ctx.response.body = 'Not JSON.';
          await next();
        })
      );

      try {
        await testGraphQLOperation({
          port,
          expectedResolvedCacheValue: {
            parseError: 'Unexpected token N in JSON at position 0',
          },
        });
      } finally {
        close();
      }
    } finally {
      revertGlobals();
    }
  });

  tests.add(
    '`GraphQL` method `operate` with malformed response payload',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(
          new Koa().use(async (ctx, next) => {
            ctx.response.status = 200;
            ctx.response.type = 'json';
            ctx.response.body = '[{"bad": true}]';
            await next();
          })
        );

        try {
          await testGraphQLOperation({
            port,
            expectedResolvedCacheValue: {
              parseError: 'Malformed payload.',
            },
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with HTTP and GraphQL errors',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(createGraphQLKoaApp());

        try {
          await testGraphQLOperation({
            port,
            operation: { query: '{ b }' },
            expectedResolvedCacheValue: {
              httpError: {
                status: 400,
                statusText: 'Bad Request',
              },
              graphQLErrors: [
                {
                  message: 'Cannot query field "b" on type "Query".',
                  locations: [
                    {
                      line: 1,
                      column: 3,
                    },
                  ],
                },
              ],
            },
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with `resetOnLoad` option',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(createGraphQLKoaApp());

        try {
          const initialGraphQLCache = {
            abcdefg: {
              data: {
                b: true,
              },
            },
          };

          const expectedResolvedCacheValue = {
            data: {
              echo: 'hello',
            },
          };

          await testGraphQLOperation({
            port,
            initialGraphQLCache,
            expectedResolvedCacheValue,
          });

          await testGraphQLOperation({
            port,
            resetOnLoad: true,
            initialGraphQLCache,
            expectedResolvedCacheValue,
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with `reloadOnLoad` option',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        const { port, close } = await listen(createGraphQLKoaApp());

        try {
          await testGraphQLOperation({
            port,
            reloadOnLoad: true,
            expectedResolvedCacheValue: {
              data: {
                echo: 'hello',
              },
            },
          });
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with option `cacheKeyCreator` not a function',
    () => {
      const graphql = new GraphQL();
      throws(() => {
        graphql.operate({
          operation: { query: '' },
          cacheKeyCreator: true,
        });
      }, new TypeError('operate() option “cacheKeyCreator” must be a function.'));
    }
  );

  tests.add(
    '`GraphQL` method `operate` with both `reloadOnLoad` and `resetOnLoad` options true',
    () => {
      const graphql = new GraphQL();
      throws(() => {
        graphql.operate({
          operation: { query: '' },
          reloadOnLoad: true,
          resetOnLoad: true,
        });
      }, new TypeError('operate() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'));
    }
  );

  tests.add(
    '`GraphQL` method `operate` with concurrent identical operations, first responds first',
    async () => {
      const revertGlobals = revertableGlobals({ fetch, Response });

      try {
        let requestCount = 0;

        const { port, close } = await listen(
          createGraphQLKoaApp({
            requestCount: {
              type: GraphQLInt,
              resolve: () => ++requestCount,
            },
          })
        );

        try {
          const graphql = new GraphQL();
          const queryOptions = {
            fetchOptionsOverride(options) {
              options.url = `http://localhost:${port}`;
            },
            operation: {
              query: '{ requestCount }',
            },
          };

          const expectedResolvedCacheValue1 = {
            data: {
              requestCount: 1,
            },
          };
          const expectedResolvedCacheValue2 = {
            data: {
              requestCount: 2,
            },
          };

          const fetchEvent1 = promisifyEvent(graphql, 'fetch');
          const cacheEvent1 = promisifyEvent(graphql, 'cache');

          const {
            cacheKey: cacheKey1,
            cacheValue: cacheValue1,
            cacheValuePromise: cacheValuePromise1,
          } = graphql.operate(queryOptions);

          strictEqual(cacheValue1, undefined);
          strictEqual(cacheValuePromise1 instanceof Promise, true);
          strictEqual(cacheKey1 in graphql.operations, true);
          deepStrictEqual(graphql.operations[cacheKey1], [cacheValuePromise1]);

          const fetchEvent1Data = await fetchEvent1;
          const fetchEvent2 = promisifyEvent(graphql, 'fetch');

          deepStrictEqual(fetchEvent1Data, {
            cacheKey: cacheKey1,
            cacheValuePromise: cacheValuePromise1,
          });

          const {
            cacheKey: cacheKey2,
            cacheValue: cacheValue2,
            cacheValuePromise: cacheValuePromise2,
          } = graphql.operate(queryOptions);

          strictEqual(cacheKey2, cacheKey1);
          strictEqual(cacheValue2, undefined);
          strictEqual(cacheValuePromise2 instanceof Promise, true);
          notStrictEqual(cacheValuePromise2, cacheValuePromise1);
          strictEqual(cacheKey2 in graphql.operations, true);
          deepStrictEqual(graphql.operations[cacheKey2], [
            cacheValuePromise1,
            cacheValuePromise2,
          ]);

          const fetchEvent2Data = await fetchEvent2;

          deepStrictEqual(fetchEvent2Data, {
            cacheKey: cacheKey2,
            cacheValuePromise: cacheValuePromise2,
          });

          const cacheEvent1Data = await cacheEvent1;
          const cacheEvent2 = promisifyEvent(graphql, 'cache');

          strictEqual(typeof cacheEvent1Data, 'object');
          strictEqual(cacheEvent1Data.cacheKey, cacheKey1);
          deepStrictEqual(cacheEvent1Data.cacheValue, graphql.cache[cacheKey1]);
          deepStrictEqual(
            graphql.cache[cacheKey1],
            expectedResolvedCacheValue1
          );
          strictEqual(cacheEvent1Data.response instanceof Response, true);

          const cacheValueResolved1 = await cacheValuePromise1;

          deepStrictEqual(graphql.operations, {
            [cacheKey2]: [cacheValuePromise2],
          });
          deepStrictEqual(cacheValueResolved1, expectedResolvedCacheValue1);

          const cacheEvent2Data = await cacheEvent2;

          strictEqual(typeof cacheEvent2Data, 'object');
          strictEqual(cacheEvent2Data.cacheKey, cacheKey2);
          deepStrictEqual(cacheEvent2Data.cacheValue, graphql.cache[cacheKey2]);
          deepStrictEqual(
            graphql.cache[cacheKey2],
            expectedResolvedCacheValue2
          );
          strictEqual(cacheEvent2Data.response instanceof Response, true);

          const cacheValueResolved2 = await cacheValuePromise2;

          deepStrictEqual(graphql.operations, {});
          deepStrictEqual(cacheValueResolved2, expectedResolvedCacheValue2);
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with concurrent identical operations, second responds first',
    async () => {
      let fetchCount = 0;
      let resolveFirstOperationDelay;

      // Ideally this promise would have a timeout.
      const firstOperationDelay = new Promise((resolve) => {
        resolveFirstOperationDelay = resolve;
      });

      const revertGlobals = revertableGlobals({
        fetch(...args) {
          const result = fetch(...args);

          if (++fetchCount === 2)
            result.finally(() => {
              resolveFirstOperationDelay();
            });

          return result;
        },
        Response,
      });

      try {
        let requestCount = 0;

        const { port, close } = await listen(
          createGraphQLKoaApp({
            requestCount: {
              type: GraphQLInt,
              async resolve() {
                const thisRequestCount = ++requestCount;

                if (thisRequestCount === 1) await firstOperationDelay;

                return thisRequestCount;
              },
            },
          })
        );

        try {
          const graphql = new GraphQL();
          const queryOptions = {
            fetchOptionsOverride(options) {
              options.url = `http://localhost:${port}`;
            },
            operation: {
              query: '{ requestCount }',
            },
          };

          const expectedResolvedCacheValue1 = {
            data: {
              requestCount: 1,
            },
          };
          const expectedResolvedCacheValue2 = {
            data: {
              requestCount: 2,
            },
          };

          const fetchEvent1 = promisifyEvent(graphql, 'fetch');
          const cacheEvent1 = promisifyEvent(graphql, 'cache');

          const {
            cacheKey: cacheKey1,
            cacheValue: cacheValue1,
            cacheValuePromise: cacheValuePromise1,
          } = graphql.operate(queryOptions);

          strictEqual(cacheValue1, undefined);
          strictEqual(cacheValuePromise1 instanceof Promise, true);
          strictEqual(cacheKey1 in graphql.operations, true);
          deepStrictEqual(graphql.operations[cacheKey1], [cacheValuePromise1]);

          const fetchEvent1Data = await fetchEvent1;
          const fetchEvent2 = promisifyEvent(graphql, 'fetch');

          deepStrictEqual(fetchEvent1Data, {
            cacheKey: cacheKey1,
            cacheValuePromise: cacheValuePromise1,
          });

          const {
            cacheKey: cacheKey2,
            cacheValue: cacheValue2,
            cacheValuePromise: cacheValuePromise2,
          } = graphql.operate(queryOptions);

          strictEqual(cacheKey2, cacheKey1);
          strictEqual(cacheValue2, undefined);
          strictEqual(cacheValuePromise2 instanceof Promise, true);
          notStrictEqual(cacheValuePromise2, cacheValuePromise1);
          strictEqual(cacheKey2 in graphql.operations, true);
          deepStrictEqual(graphql.operations[cacheKey2], [
            cacheValuePromise1,
            cacheValuePromise2,
          ]);

          const fetchEvent2Data = await fetchEvent2;

          deepStrictEqual(fetchEvent2Data, {
            cacheKey: cacheKey2,
            cacheValuePromise: cacheValuePromise2,
          });

          const cacheEvent1Data = await cacheEvent1;
          const cacheEvent2 = promisifyEvent(graphql, 'cache');

          strictEqual(typeof cacheEvent1Data, 'object');
          strictEqual(cacheEvent1Data.cacheKey, cacheKey1);
          deepStrictEqual(cacheEvent1Data.cacheValue, graphql.cache[cacheKey1]);
          deepStrictEqual(
            graphql.cache[cacheKey1],
            expectedResolvedCacheValue1
          );
          strictEqual(cacheEvent1Data.response instanceof Response, true);

          const cacheValueResolved1 = await cacheValuePromise1;

          deepStrictEqual(graphql.operations, {
            [cacheKey2]: [cacheValuePromise2],
          });
          deepStrictEqual(cacheValueResolved1, expectedResolvedCacheValue1);

          const cacheEvent2Data = await cacheEvent2;

          strictEqual(typeof cacheEvent2Data, 'object');
          strictEqual(cacheEvent2Data.cacheKey, cacheKey2);
          deepStrictEqual(cacheEvent2Data.cacheValue, graphql.cache[cacheKey2]);
          deepStrictEqual(
            graphql.cache[cacheKey2],
            expectedResolvedCacheValue2
          );
          strictEqual(cacheEvent2Data.response instanceof Response, true);

          const cacheValueResolved2 = await cacheValuePromise2;

          deepStrictEqual(graphql.operations, {});
          deepStrictEqual(cacheValueResolved2, expectedResolvedCacheValue2);
        } finally {
          close();
        }
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`GraphQL` method `reload` without `exceptCacheKey` parameter',
    async () => {
      const graphql = new GraphQL();
      const reloadEvent = promisifyEvent(graphql, 'reload');

      graphql.reload();

      const reloadEventData = await reloadEvent;

      strictEqual(reloadEventData.exceptCacheKey, undefined);
    }
  );

  tests.add(
    '`GraphQL` method `reload` with `exceptCacheKey` parameter',
    async () => {
      const graphql = new GraphQL();
      const exceptCacheKey = 'abcdefg';
      const reloadEvent = promisifyEvent(graphql, 'reload');

      graphql.reload(exceptCacheKey);

      const reloadEventData = await reloadEvent;

      strictEqual(reloadEventData.exceptCacheKey, exceptCacheKey);
    }
  );

  tests.add(
    '`GraphQL` method `reset` without `exceptCacheKey` parameter',
    async () => {
      const graphql = new GraphQL({
        cache: {
          abcdefg: {
            data: {
              echo: 'hello',
            },
          },
        },
      });

      const resetEvent = promisifyEvent(graphql, 'reset');

      graphql.reset();

      const resetEventData = await resetEvent;

      strictEqual(resetEventData.exceptCacheKey, undefined);
      deepStrictEqual(graphql.cache, {});
    }
  );

  tests.add(
    '`GraphQL` method `reset` with `exceptCacheKey` parameter',
    async () => {
      const exceptCacheKey = 'abcdefg';
      const cache1 = {
        [exceptCacheKey]: {
          data: {
            echo: 'hello',
          },
        },
      };
      const cache2 = {
        ghijkl: {
          data: {
            echo: 'hello',
          },
        },
      };
      const graphql = new GraphQL({
        cache: {
          ...cache1,
          ...cache2,
        },
      });
      const resetEvent = promisifyEvent(graphql, 'reset');

      graphql.reset(exceptCacheKey);

      const resetEventData = await resetEvent;

      strictEqual(resetEventData.exceptCacheKey, exceptCacheKey);
      deepStrictEqual(graphql.cache, cache1);
    }
  );
};

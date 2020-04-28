import 'cross-fetch/dist/node-polyfill.js';
import { deepStrictEqual, strictEqual, throws } from 'assert';
import Koa from 'koa';
import { GraphQL } from '../../universal/index.mjs';
import createGraphQLKoaApp from '../createGraphQLKoaApp.js';
import graphql from '../graphql.js';
import listen from '../listen.js';
import promisifyEvent from '../promisifyEvent.js';
import testGraphQLOperation from '../testGraphQLOperation.mjs';

const { GraphQLInt } = graphql;

export default (tests) => {
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
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const expectedResolvedCacheValue = { data: { echo: 'hello' } };

        let hash;

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
    }
  );

  tests.add(
    '`GraphQL` method `operate` with global `fetch` unavailable',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        // Store the global fetch polyfill.
        const { fetch } = global;

        // Delete the global fetch polyfill.
        delete global.fetch;

        await testGraphQLOperation({
          port,
          expectedResolvedCacheValue: {
            fetchError: 'Global fetch API or polyfill unavailable.',
          },
          responseExpected: false,
        });

        // Restore the global fetch polyfill.
        global.fetch = fetch;
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`GraphQL` method `operate` with HTTP and parse errors',
    async () => {
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
            parseError: `invalid json response body at http://localhost:${port}/ reason: Unexpected token N in JSON at position 0`,
          },
        });
      } finally {
        close();
      }
    }
  );

  tests.add('`GraphQL` method `operate` with parse error', async () => {
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
          parseError: `invalid json response body at http://localhost:${port}/ reason: Unexpected token N in JSON at position 0`,
        },
      });
    } finally {
      close();
    }
  });

  tests.add(
    '`GraphQL` method `operate` with malformed response payload',
    async () => {
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
    }
  );

  tests.add(
    '`GraphQL` method `operate` with HTTP and GraphQL errors',
    async () => {
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
    }
  );

  tests.add(
    '`GraphQL` method `operate` with `resetOnLoad` option',
    async () => {
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
      }, new Error('operate() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'));
    }
  );

  tests.add(
    '`GraphQL` with concurrent identical operations share a request',
    async () => {
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

        const {
          cacheKey: cacheKey1,
          cacheValuePromise: cacheValuePromise1,
        } = graphql.operate(queryOptions);
        const {
          cacheKey: cacheKey2,
          cacheValuePromise: cacheValuePromise2,
        } = graphql.operate(queryOptions);

        strictEqual(cacheKey1, cacheKey2);
        strictEqual(cacheValuePromise1, cacheValuePromise2);
        strictEqual(Object.keys(graphql.operations).length, 1);
        strictEqual(cacheKey1 in graphql.operations, true);

        await Promise.all([cacheValuePromise1, cacheValuePromise2]);
      } finally {
        close();
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

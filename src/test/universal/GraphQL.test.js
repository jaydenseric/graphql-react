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
const timeLimitPromise = require('../timeLimitPromise');

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
      let fetchCount = 0;
      let firstOperationRespondedPromiseResolve;

      const firstOperationRespondedPromise = timeLimitPromise(
        new Promise((resolve) => {
          firstOperationRespondedPromiseResolve = resolve;
        })
      );

      const revertGlobals = revertableGlobals({
        fetch(...args) {
          const result = fetch(...args);

          if (++fetchCount === 1)
            result.finally(() => {
              firstOperationRespondedPromiseResolve();
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

                if (thisRequestCount === 2)
                  await firstOperationRespondedPromise;

                return thisRequestCount;
              },
            },
          })
        );

        try {
          let cacheKey;
          let cacheValuePromise1;
          let cacheValuePromise2;

          let fetchEventCount = 0;
          let fetchEvent1PromiseResolve;
          let fetchEvent1PromiseReject;
          let fetchEvent2PromiseResolve;
          let fetchEvent2PromiseReject;

          let cacheEventCount = 0;
          let cacheEvent1PromiseResolve;
          let cacheEvent1PromiseReject;
          let cacheEvent2PromiseResolve;
          let cacheEvent2PromiseReject;

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

          const graphql = new GraphQL();
          const queryOptions = {
            fetchOptionsOverride(options) {
              options.url = `http://localhost:${port}`;
            },
            operation: {
              query: '{ requestCount }',
            },
          };

          const fetchEvent1Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              fetchEvent1PromiseResolve = resolve;
              fetchEvent1PromiseReject = reject;
            })
          );

          const fetchEvent2Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              fetchEvent2PromiseResolve = resolve;
              fetchEvent2PromiseReject = reject;
            })
          );

          graphql.on('fetch', (eventData) => {
            switch (++fetchEventCount) {
              case 1:
                try {
                  strictEqual(typeof eventData, 'object');
                  deepStrictEqual(Object.keys(eventData), [
                    'cacheKey',
                    'cacheValuePromise',
                  ]);
                  strictEqual(typeof eventData.cacheKey, 'string');
                  strictEqual(
                    eventData.cacheValuePromise instanceof Promise,
                    true
                  );

                  ({ cacheKey } = eventData);
                  cacheValuePromise1 = eventData.cacheValuePromise;

                  fetchEvent1PromiseResolve();
                } catch (error) {
                  fetchEvent1PromiseReject(error);
                }

                break;
              case 2:
                try {
                  strictEqual(typeof eventData, 'object');
                  deepStrictEqual(Object.keys(eventData), [
                    'cacheKey',
                    'cacheValuePromise',
                  ]);
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValuePromise instanceof Promise,
                    true
                  );

                  cacheValuePromise2 = eventData.cacheValuePromise;

                  fetchEvent2PromiseResolve();
                } catch (error) {
                  fetchEvent2PromiseReject(error);
                }
            }
          });

          const cacheEvent1Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              cacheEvent1PromiseResolve = resolve;
              cacheEvent1PromiseReject = reject;
            })
          );

          const cacheEvent2Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              cacheEvent2PromiseResolve = resolve;
              cacheEvent2PromiseReject = reject;
            })
          );

          graphql.on('cache', (eventData) => {
            switch (++cacheEventCount) {
              case 1:
                try {
                  strictEqual(typeof eventData, 'object');
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValue === graphql.cache[cacheKey],
                    true
                  );
                  deepStrictEqual(
                    eventData.cacheValue,
                    expectedResolvedCacheValue1
                  );
                  deepStrictEqual(
                    graphql.cache[cacheKey],
                    expectedResolvedCacheValue1
                  );
                  strictEqual(eventData.response instanceof Response, true);
                  deepStrictEqual(graphql.operations, {
                    [cacheKey]: [cacheValuePromise2],
                  });

                  cacheEvent1PromiseResolve();
                } catch (error) {
                  cacheEvent1PromiseReject(error);
                }
                break;
              case 2:
                try {
                  strictEqual(typeof eventData, 'object');
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValue === graphql.cache[cacheKey],
                    true
                  );
                  deepStrictEqual(
                    eventData.cacheValue,
                    expectedResolvedCacheValue2
                  );
                  deepStrictEqual(
                    graphql.cache[cacheKey],
                    expectedResolvedCacheValue2
                  );
                  strictEqual(eventData.response instanceof Response, true);
                  deepStrictEqual(graphql.operations, {});

                  cacheEvent2PromiseResolve();
                } catch (error) {
                  cacheEvent2PromiseReject(error);
                }
            }
          });

          const operateReturn1 = graphql.operate(queryOptions);

          strictEqual(typeof operateReturn1.cacheKey, 'string');
          strictEqual(operateReturn1.cacheKey, cacheKey);
          strictEqual(operateReturn1.cacheValue, undefined);
          strictEqual(
            operateReturn1.cacheValuePromise instanceof Promise,
            true
          );
          strictEqual(operateReturn1.cacheValuePromise, cacheValuePromise1);
          deepStrictEqual(graphql.operations[cacheKey], [cacheValuePromise1]);

          await fetchEvent1Promise;

          const operateReturn2 = graphql.operate(queryOptions);

          strictEqual(typeof operateReturn2.cacheKey, 'string');
          strictEqual(operateReturn2.cacheKey, cacheKey);
          strictEqual(operateReturn2.cacheValue, undefined);
          strictEqual(
            operateReturn2.cacheValuePromise instanceof Promise,
            true
          );
          strictEqual(operateReturn2.cacheValuePromise, cacheValuePromise2);
          notStrictEqual(cacheValuePromise2, cacheValuePromise1);
          deepStrictEqual(graphql.operations[cacheKey], [
            cacheValuePromise1,
            cacheValuePromise2,
          ]);

          await fetchEvent2Promise;
          await cacheEvent1Promise;

          deepStrictEqual(
            await cacheValuePromise1,
            expectedResolvedCacheValue1
          );

          await cacheEvent2Promise;

          deepStrictEqual(
            await cacheValuePromise2,
            expectedResolvedCacheValue2
          );
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
      let secondOperationRespondedPromiseResolve;

      const secondOperationRespondedPromise = timeLimitPromise(
        new Promise((resolve) => {
          secondOperationRespondedPromiseResolve = resolve;
        })
      );

      const revertGlobals = revertableGlobals({
        fetch(...args) {
          const result = fetch(...args);

          if (++fetchCount === 2)
            result.finally(() => {
              secondOperationRespondedPromiseResolve();
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

                if (thisRequestCount === 1)
                  await secondOperationRespondedPromise;

                return thisRequestCount;
              },
            },
          })
        );

        try {
          let cacheKey;
          let cacheValuePromise1;
          let cacheValuePromise2;

          let fetchEventCount = 0;
          let fetchEvent1PromiseResolve;
          let fetchEvent1PromiseReject;
          let fetchEvent2PromiseResolve;
          let fetchEvent2PromiseReject;

          let cacheEventCount = 0;
          let cacheEvent1PromiseResolve;
          let cacheEvent1PromiseReject;
          let cacheEvent2PromiseResolve;
          let cacheEvent2PromiseReject;

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

          const graphql = new GraphQL();
          const queryOptions = {
            fetchOptionsOverride(options) {
              options.url = `http://localhost:${port}`;
            },
            operation: {
              query: '{ requestCount }',
            },
          };

          const fetchEvent1Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              fetchEvent1PromiseResolve = resolve;
              fetchEvent1PromiseReject = reject;
            })
          );

          const fetchEvent2Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              fetchEvent2PromiseResolve = resolve;
              fetchEvent2PromiseReject = reject;
            })
          );

          graphql.on('fetch', (eventData) => {
            switch (++fetchEventCount) {
              case 1:
                try {
                  strictEqual(typeof eventData, 'object');
                  deepStrictEqual(Object.keys(eventData), [
                    'cacheKey',
                    'cacheValuePromise',
                  ]);
                  strictEqual(typeof eventData.cacheKey, 'string');
                  strictEqual(
                    eventData.cacheValuePromise instanceof Promise,
                    true
                  );

                  ({ cacheKey } = eventData);
                  cacheValuePromise1 = eventData.cacheValuePromise;

                  fetchEvent1PromiseResolve();
                } catch (error) {
                  fetchEvent1PromiseReject(error);
                }

                break;
              case 2:
                try {
                  strictEqual(typeof eventData, 'object');
                  deepStrictEqual(Object.keys(eventData), [
                    'cacheKey',
                    'cacheValuePromise',
                  ]);
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValuePromise instanceof Promise,
                    true
                  );

                  cacheValuePromise2 = eventData.cacheValuePromise;

                  fetchEvent2PromiseResolve();
                } catch (error) {
                  fetchEvent2PromiseReject(error);
                }
            }
          });

          const cacheEvent1Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              cacheEvent1PromiseResolve = resolve;
              cacheEvent1PromiseReject = reject;
            })
          );

          const cacheEvent2Promise = timeLimitPromise(
            new Promise((resolve, reject) => {
              cacheEvent2PromiseResolve = resolve;
              cacheEvent2PromiseReject = reject;
            })
          );

          graphql.on('cache', (eventData) => {
            switch (++cacheEventCount) {
              case 1:
                try {
                  strictEqual(typeof eventData, 'object');
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValue === graphql.cache[cacheKey],
                    true
                  );
                  deepStrictEqual(
                    eventData.cacheValue,
                    expectedResolvedCacheValue1
                  );
                  deepStrictEqual(
                    graphql.cache[cacheKey],
                    expectedResolvedCacheValue1
                  );
                  strictEqual(eventData.response instanceof Response, true);
                  deepStrictEqual(graphql.operations, {
                    [cacheKey]: [cacheValuePromise2],
                  });

                  cacheEvent1PromiseResolve();
                } catch (error) {
                  cacheEvent1PromiseReject(error);
                }
                break;
              case 2:
                try {
                  strictEqual(typeof eventData, 'object');
                  strictEqual(eventData.cacheKey, cacheKey);
                  strictEqual(
                    eventData.cacheValue === graphql.cache[cacheKey],
                    true
                  );
                  deepStrictEqual(
                    eventData.cacheValue,
                    expectedResolvedCacheValue2
                  );
                  deepStrictEqual(
                    graphql.cache[cacheKey],
                    expectedResolvedCacheValue2
                  );
                  strictEqual(eventData.response instanceof Response, true);
                  deepStrictEqual(graphql.operations, {});

                  cacheEvent2PromiseResolve();
                } catch (error) {
                  cacheEvent2PromiseReject(error);
                }
            }
          });

          const operateReturn1 = graphql.operate(queryOptions);

          strictEqual(typeof operateReturn1.cacheKey, 'string');
          strictEqual(operateReturn1.cacheKey, cacheKey);
          strictEqual(operateReturn1.cacheValue, undefined);
          strictEqual(
            operateReturn1.cacheValuePromise instanceof Promise,
            true
          );
          strictEqual(operateReturn1.cacheValuePromise, cacheValuePromise1);
          deepStrictEqual(graphql.operations[cacheKey], [cacheValuePromise1]);

          await fetchEvent1Promise;

          const operateReturn2 = graphql.operate(queryOptions);

          strictEqual(typeof operateReturn2.cacheKey, 'string');
          strictEqual(operateReturn2.cacheKey, cacheKey);
          strictEqual(operateReturn2.cacheValue, undefined);
          strictEqual(
            operateReturn2.cacheValuePromise instanceof Promise,
            true
          );
          strictEqual(operateReturn2.cacheValuePromise, cacheValuePromise2);
          notStrictEqual(cacheValuePromise2, cacheValuePromise1);
          deepStrictEqual(graphql.operations[cacheKey], [
            cacheValuePromise1,
            cacheValuePromise2,
          ]);

          await fetchEvent2Promise;
          await cacheEvent1Promise;

          deepStrictEqual(
            await cacheValuePromise1,
            expectedResolvedCacheValue1
          );

          await cacheEvent2Promise;

          deepStrictEqual(
            await cacheValuePromise2,
            expectedResolvedCacheValue2
          );
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

import 'cross-fetch/dist/node-polyfill.js';
import { deepStrictEqual, strictEqual, throws } from 'assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server.node.js';
import ReactTestRenderer from 'react-test-renderer';
import {
  GraphQL,
  GraphQLContext,
  GraphQLProvider,
  useGraphQL,
} from '../../universal/index.mjs';
import createGraphQLKoaApp from '../createGraphQLKoaApp.js';
import listen from '../listen.js';
import promisifyEvent from '../promisifyEvent.js';
import sleep from '../sleep.js';

const RenderUseGraphQL = (operationOptions) =>
  JSON.stringify(useGraphQL(operationOptions));

export default (tests) => {
  tests.add(
    '`useGraphQL` option `loadOnMount` false (default) with no initial cache',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const { cacheKey: operation1CacheKey } = graphql.operate(
          operation1Options
        );

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const { cacheKey: operation2CacheKey } = graphql.operate(
          operation2Options
        );

        await Promise.all(Object.values(graphql.operations));

        graphql.reset();

        let fetched = false;

        graphql.on('fetch', () => {
          fetched = true;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, false);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        strictEqual(renderResult1.cacheValue, undefined);

        // Second render with different props.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, false);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        strictEqual(renderResult2.cacheValue, undefined);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` false (default) with initial cache for first operation',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation1CacheKey,
          cacheValuePromise: operation1CacheValuePromise,
        } = graphql.operate(operation1Options);

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation2CacheKey,
          cacheValuePromise: operation2CacheValuePromise,
        } = graphql.operate(operation2Options);

        const [operation1CacheValue] = await Promise.all([
          operation1CacheValuePromise,
          operation2CacheValuePromise,
        ]);

        // Ensure only the first operation is cached.
        delete graphql.cache[operation2CacheKey];

        let fetched = false;

        graphql.on('fetch', () => {
          fetched = true;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render with cache.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, false);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        deepStrictEqual(renderResult1.cacheValue, operation1CacheValue);

        // Second render with different props, no cache.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, false);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        deepStrictEqual(renderResult2.cacheValue, undefined);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` false (default) with initial cache for both operations',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation1CacheKey,
          cacheValuePromise: operation1CacheValuePromise,
        } = graphql.operate(operation1Options);

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation2CacheKey,
          cacheValuePromise: operation2CacheValuePromise,
        } = graphql.operate(operation2Options);

        const [operation1CacheValue, operation2CacheValue] = await Promise.all([
          operation1CacheValuePromise,
          operation2CacheValuePromise,
        ]);

        let fetched = false;

        graphql.on('fetch', () => {
          fetched = true;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, false);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        deepStrictEqual(renderResult1.cacheValue, operation1CacheValue);

        // Second render with different props.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, false);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        deepStrictEqual(renderResult2.cacheValue, operation2CacheValue);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` true with no initial cache',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const { cacheKey: operation1CacheKey } = graphql.operate(
          operation1Options
        );

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const { cacheKey: operation2CacheKey } = graphql.operate(
          operation2Options
        );

        await Promise.all(Object.values(graphql.operations));

        graphql.reset();

        let cacheKeyFetched;

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(cacheKeyFetched, operation1CacheKey);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, true);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        strictEqual(renderResult1.cacheValue, undefined);

        // Second render with different props.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(cacheKeyFetched, operation2CacheKey);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, true);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        strictEqual(renderResult2.cacheValue, undefined);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` true with initial cache for first operation',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation1CacheKey,
          cacheValuePromise: operation1CacheValuePromise,
        } = graphql.operate(operation1Options);

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation2CacheKey,
          cacheValuePromise: operation2CacheValuePromise,
        } = graphql.operate(operation2Options);

        const [operation1CacheValue] = await Promise.all([
          operation1CacheValuePromise,
          operation2CacheValuePromise,
        ]);

        // Ensure only the first operation is cached.
        delete graphql.cache[operation2CacheKey];

        let fetched = false;

        graphql.on('fetch', () => {
          fetched = true;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render with cache.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, false);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        deepStrictEqual(renderResult1.cacheValue, operation1CacheValue);

        // Second render with different props, no cache.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, true);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, true);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        deepStrictEqual(renderResult2.cacheValue, undefined);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` true with initial cache for both operations',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operation1Options = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation1CacheKey,
          cacheValuePromise: operation1CacheValuePromise,
        } = graphql.operate(operation1Options);

        const operation2Options = {
          operation: { query: '{ b: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operation2CacheKey,
          cacheValuePromise: operation2CacheValuePromise,
        } = graphql.operate(operation2Options);

        const [operation1CacheValue, operation2CacheValue] = await Promise.all([
          operation1CacheValuePromise,
          operation2CacheValuePromise,
        ]);

        let fetched = false;

        graphql.on('fetch', () => {
          fetched = true;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation1Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult1 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult1.loading, false);
        strictEqual(renderResult1.cacheKey, operation1CacheKey);
        deepStrictEqual(renderResult1.cacheValue, operation1CacheValue);

        // Second render with different props.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operation2Options} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(fetched, false);

        const renderResult2 = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult2.loading, false);
        strictEqual(renderResult2.cacheKey, operation2CacheKey);
        deepStrictEqual(renderResult2.cacheValue, operation2CacheValue);
      } finally {
        close();
      }
    }
  );

  tests.add(
    '`useGraphQL` option `loadOnMount` true with initial cache, after first render hydration period',
    async () => {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const graphql = new GraphQL();
        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const operationOptions = {
          operation: { query: '{ a: echo }' },
          fetchOptionsOverride,
        };
        const {
          cacheKey: operationCacheKey,
          cacheValuePromise: operationCacheValuePromise,
        } = graphql.operate(operationOptions);

        const operationCacheValue = await operationCacheValuePromise;

        let cacheKeyFetched;

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey;
        });

        const testRenderer = ReactTestRenderer.create(null);

        // First render.
        ReactTestRenderer.act(() => {
          testRenderer.update(<GraphQLProvider graphql={graphql} />);
        });

        // Exceed the 1000 ms duration considered the post SSR first render
        // hydration period.
        await sleep(1100);

        // Second render.
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <RenderUseGraphQL {...operationOptions} loadOnMount />
            </GraphQLProvider>
          );
        });

        strictEqual(cacheKeyFetched, operationCacheKey);

        const renderResult = JSON.parse(testRenderer.toJSON());

        strictEqual(renderResult.loading, true);
        strictEqual(renderResult.cacheKey, operationCacheKey);
        deepStrictEqual(renderResult.cacheValue, operationCacheValue);
      } finally {
        close();
      }
    }
  );

  tests.add('`useGraphQL` option `reloadOnLoad` true', async () => {
    const { port, close } = await listen(createGraphQLKoaApp());

    try {
      const graphql = new GraphQL();
      const reloadEvent = promisifyEvent(graphql, 'reload');
      const testRenderer = ReactTestRenderer.create(null);

      ReactTestRenderer.act(() => {
        testRenderer.update(
          <GraphQLProvider graphql={graphql}>
            <RenderUseGraphQL
              operation={{ query: '{ echo }' }}
              fetchOptionsOverride={(options) => {
                options.url = `http://localhost:${port}`;
              }}
              loadOnMount
              reloadOnLoad
            />
          </GraphQLProvider>
        );
      });

      const renderResult = JSON.parse(testRenderer.toJSON());
      const reloadEventData = await reloadEvent;

      strictEqual(reloadEventData.exceptCacheKey, renderResult.cacheKey);
    } finally {
      close();
    }
  });

  tests.add('`useGraphQL` option `resetOnLoad` true', async () => {
    const { port, close } = await listen(createGraphQLKoaApp());

    try {
      const graphql = new GraphQL();
      const resetEvent = promisifyEvent(graphql, 'reset');
      const testRenderer = ReactTestRenderer.create(null);

      ReactTestRenderer.act(() => {
        testRenderer.update(
          <GraphQLProvider graphql={graphql}>
            <RenderUseGraphQL
              operation={{ query: '{ echo }' }}
              fetchOptionsOverride={(options) => {
                options.url = `http://localhost:${port}`;
              }}
              loadOnMount
              resetOnLoad
            />
          </GraphQLProvider>
        );
      });

      const renderResult = JSON.parse(testRenderer.toJSON());
      const resetEventData = await resetEvent;

      strictEqual(resetEventData.exceptCacheKey, renderResult.cacheKey);
    } finally {
      close();
    }
  });

  tests.add(
    '`useGraphQL` options `reloadOnLoad` and `resetOnLoad` true',
    () => {
      throws(() => {
        ReactDOMServer.renderToString(
          <GraphQLProvider graphql={new GraphQL()}>
            <RenderUseGraphQL
              operation={{ query: '' }}
              reloadOnLoad
              resetOnLoad
            />
          </GraphQLProvider>
        );
      }, new Error('useGraphQL() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'));
    }
  );

  tests.add('`useGraphQL` with first render date context missing', async () => {
    const { port, close } = await listen(createGraphQLKoaApp());

    try {
      const graphql = new GraphQL();
      const fetchOptionsOverride = (options) => {
        options.url = `http://localhost:${port}`;
      };

      const operationOptions = {
        operation: { query: '{ a: echo }' },
        fetchOptionsOverride,
      };
      const {
        cacheKey: operationCacheKey,
        cacheValuePromise: operationCacheValuePromise,
      } = graphql.operate(operationOptions);

      const operationCacheValue = await operationCacheValuePromise;

      let cacheKeyFetched;

      graphql.on('fetch', ({ cacheKey }) => {
        cacheKeyFetched = cacheKey;
      });

      const testRenderer = ReactTestRenderer.create(null);

      ReactTestRenderer.act(() => {
        testRenderer.update(
          <GraphQLContext.Provider value={graphql}>
            <RenderUseGraphQL {...operationOptions} loadOnMount />
          </GraphQLContext.Provider>
        );
      });

      const { loading, cacheKey, cacheValue } = JSON.parse(
        testRenderer.toJSON()
      );

      strictEqual(cacheKeyFetched, operationCacheKey);
      strictEqual(loading, true);
      strictEqual(cacheKey, operationCacheKey);
      deepStrictEqual(cacheValue, operationCacheValue);
    } finally {
      close();
    }
  });

  tests.add('`useGraphQL` with GraphQL context missing', () => {
    throws(() => {
      ReactDOMServer.renderToString(
        <RenderUseGraphQL operation={{ query: '' }} />
      );
    }, new Error('GraphQL context missing.'));
  });

  tests.add('`useGraphQL` with GraphQL context not a GraphQL instance', () => {
    throws(() => {
      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={false}>
          <RenderUseGraphQL operation={{ query: '' }} />
        </GraphQLContext.Provider>
      );
    }, new Error('GraphQL context must be a GraphQL instance.'));
  });
};

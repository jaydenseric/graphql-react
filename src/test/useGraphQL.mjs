import 'cross-fetch/polyfill'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactTestRenderer from 'react-test-renderer'
import t from 'tap'
import { GraphQL } from '../universal/GraphQL'
import { GraphQLContext } from '../universal/GraphQLContext'
import { GraphQLProvider } from '../universal/GraphQLProvider'
import { useGraphQL } from '../universal/useGraphQL'
import { createGraphQLKoaApp } from './helpers/createGraphQLKoaApp'
import { promisifyEvent } from './helpers/promisifyEvent'
import { sleep } from './helpers/sleep'
import { startServer } from './helpers/startServer'

t.test('useGraphQL()', async t => {
  const port = await startServer(t, createGraphQLKoaApp())
  const graphql = new GraphQL()

  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const operation1Options = {
    operation: { query: '{ echo }' },
    fetchOptionsOverride
  }
  const {
    cacheKey: operation1CacheKey,
    cacheValuePromise: operation1CacheValuePromise
  } = graphql.operate(operation1Options)
  const operation1CacheValue = await operation1CacheValuePromise

  const operation2Options = {
    operation: { query: '{ echo(phrase: "goodbye") }' },
    fetchOptionsOverride
  }
  const {
    cacheKey: operation2CacheKey,
    cacheValuePromise: operation2CacheValuePromise
  } = graphql.operate(operation2Options)
  const operation2CacheValue = await operation2CacheValuePromise
  const { cache } = graphql

  // eslint-disable-next-line react/prop-types
  const Component = ({ loadOnMount, ...operationOptions }) => {
    const result = useGraphQL({ loadOnMount, ...operationOptions })
    return JSON.stringify(result)
  }

  await t.test('Without initial cache', async t => {
    await t.test('`loadOnMount` true (default)', async t => {
      const graphql = new GraphQL()
      const testRenderer = ReactTestRenderer.create(null)

      await t.test('First render', t => {
        let cacheKeyFetched

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, true, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.equals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(
          cacheKeyFetched,
          operation1CacheKey,
          'GraphQL `fetch` event data property `cacheKey`'
        )
        t.end()
      })

      await t.test('Second render with different props', t => {
        let cacheKeyFetched

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, true, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.equals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(
          cacheKeyFetched,
          operation2CacheKey,
          'GraphQL `fetch` event data property `cacheKey`'
        )
        t.end()
      })
    })

    await t.test('`loadOnMount` false', async t => {
      const graphql = new GraphQL()
      const testRenderer = ReactTestRenderer.create(null)

      let fetched = false

      graphql.on('fetch', () => {
        fetched = true
      })

      await t.test('First render', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.equals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      await t.test('Second render with different props', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.equals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })
    })
  })

  await t.test('With initial cache', async t => {
    await t.test('`loadOnMount` true (default)', async t => {
      const graphql = new GraphQL({ cache })
      const testRenderer = ReactTestRenderer.create(null)

      await t.test('First render', t => {
        let fetched = false

        graphql.on('fetch', () => {
          fetched = true
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation1CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      await t.test('Second render with different props', t => {
        let fetched = false

        graphql.on('fetch', () => {
          fetched = true
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation2CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      // Exceed the 1000ms duration considered the first render hydration period.
      await sleep(1100)

      await t.test('Third render with original props again', t => {
        let cacheKeyFetched

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, true, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation1CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(
          cacheKeyFetched,
          operation1CacheKey,
          'GraphQL `fetch` event data property `cacheKey`'
        )
        t.end()
      })
    })

    await t.test('`loadOnMount` false', async t => {
      const graphql = new GraphQL({ cache })
      const testRenderer = ReactTestRenderer.create(null)

      let fetched = false

      graphql.on('fetch', () => {
        fetched = true
      })

      await t.test('First render', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation1CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      await t.test('Second render with different props', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation2CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })
    })
  })

  await t.test('With initial cache (partial)', async t => {
    await t.test('`loadOnMount` true (default)', async t => {
      const graphql = new GraphQL({
        cache: { [operation1CacheKey]: operation1CacheValue }
      })
      const testRenderer = ReactTestRenderer.create(null)

      await t.test('First render with cache', t => {
        let fetched = false

        graphql.on('fetch', () => {
          fetched = true
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation1CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      await t.test('Second render with different props, no cache', t => {
        let cacheKeyFetched

        graphql.on('fetch', ({ cacheKey }) => {
          cacheKeyFetched = cacheKey
        })

        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, true, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(
          cacheKeyFetched,
          operation2CacheKey,
          'GraphQL `fetch` event data property `cacheKey`'
        )
        t.end()
      })
    })

    await t.test('`loadOnMount` false', async t => {
      const graphql = new GraphQL({
        cache: { [operation1CacheKey]: operation1CacheValue }
      })
      const testRenderer = ReactTestRenderer.create(null)

      let fetched = false

      graphql.on('fetch', () => {
        fetched = true
      })

      await t.test('First render', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation1Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(
          cacheValue,
          operation1CacheValue,
          'Hook return `cacheValue`'
        )
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })

      await t.test('Second render with different props', t => {
        ReactTestRenderer.act(() => {
          testRenderer.update(
            <GraphQLProvider graphql={graphql}>
              <Component {...operation2Options} loadOnMount={false} />
            </GraphQLProvider>
          )
        })

        const { loading, cacheKey, cacheValue } = JSON.parse(
          testRenderer.toJSON()
        )

        t.equals(loading, false, 'Hook return `loading`')
        t.equals(cacheKey, operation2CacheKey, 'Hook return `cacheKey`')
        t.deepEquals(cacheValue, undefined, 'Hook return `cacheValue`')
        t.equals(fetched, false, 'Didn’t load')
        t.end()
      })
    })
  })

  await t.test('With `reloadOnLoad` true', async t => {
    const graphql = new GraphQL()
    const reloadEvent = promisifyEvent(graphql, 'reload')
    const testRenderer = ReactTestRenderer.create(null)

    ReactTestRenderer.act(() => {
      testRenderer.update(
        <GraphQLProvider graphql={graphql}>
          <Component
            {...operation1Options}
            loadOnMount={true}
            reloadOnLoad={true}
          />
        </GraphQLProvider>
      )
    })

    const { cacheKey } = JSON.parse(testRenderer.toJSON())
    const reloadEventData = await reloadEvent

    t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
    t.equals(
      reloadEventData.exceptCacheKey,
      operation1CacheKey,
      'GraphQL `reload` event data property `exceptCacheKey`'
    )
  })

  await t.test('With `resetOnLoad` true', async t => {
    const graphql = new GraphQL()
    const resetEvent = promisifyEvent(graphql, 'reset')
    const testRenderer = ReactTestRenderer.create(null)

    ReactTestRenderer.act(() => {
      testRenderer.update(
        <GraphQLProvider graphql={graphql}>
          <Component
            {...operation1Options}
            loadOnMount={true}
            resetOnLoad={true}
          />
        </GraphQLProvider>
      )
    })

    const { cacheKey } = JSON.parse(testRenderer.toJSON())
    const resetEventData = await resetEvent

    t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
    t.equals(
      resetEventData.exceptCacheKey,
      operation1CacheKey,
      'GraphQL `reset` event data property `exceptCacheKey`'
    )
  })

  await t.test('With both `reloadOnLoad` and `resetOnLoad` options true', t => {
    const graphql = new GraphQL()

    t.throws(() => {
      ReactDOMServer.renderToString(
        <GraphQLProvider graphql={graphql}>
          <Component
            {...operation1Options}
            reloadOnLoad={true}
            resetOnLoad={true}
          />
        </GraphQLProvider>
      )
    }, new Error('useGraphQL() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'))

    t.end()
  })

  await t.test('First render date context missing', t => {
    const graphql = new GraphQL({ cache })
    const testRenderer = ReactTestRenderer.create(null)

    let cacheKeyFetched

    graphql.on('fetch', ({ cacheKey }) => {
      cacheKeyFetched = cacheKey
    })

    ReactTestRenderer.act(() => {
      testRenderer.update(
        <GraphQLContext.Provider value={graphql}>
          <Component {...operation1Options} />
        </GraphQLContext.Provider>
      )
    })

    const { loading, cacheKey, cacheValue } = JSON.parse(testRenderer.toJSON())

    t.equals(loading, true, 'Hook return `loading`')
    t.equals(cacheKey, operation1CacheKey, 'Hook return `cacheKey`')
    t.deepEquals(cacheValue, operation1CacheValue, 'Hook return `cacheValue`')
    t.equals(
      cacheKeyFetched,
      operation1CacheKey,
      'GraphQL `fetch` event data property `cacheKey`'
    )
    t.end()
  })

  await t.test('GraphQL context missing', t => {
    t.throws(() => {
      ReactDOMServer.renderToString(<Component {...operation1Options} />)
    }, new Error('GraphQL context missing.'))

    t.end()
  })

  await t.test('GraphQL context not a GraphQL instance', t => {
    t.throws(() => {
      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={false}>
          <Component {...operation1Options} />
        </GraphQLContext.Provider>
      )
    }, new Error('GraphQL context must be a GraphQL instance.'))

    t.end()
  })
})

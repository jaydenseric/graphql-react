import 'cross-fetch/polyfill'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import t from 'tap'
import { GraphQL } from '../universal/GraphQL'
import { GraphQLContext } from '../universal/GraphQLContext'
import { useGraphQL } from '../universal/useGraphQL'
import { createGraphQLKoaApp } from './helpers/createGraphQLKoaApp'
import { startServer } from './helpers/startServer'

t.test('useGraphQL()', async t => {
  const port = await startServer(t, createGraphQLKoaApp())

  // eslint-disable-next-line require-jsdoc, react/prop-types
  const Component = ({ loadOnMount, onResult }) => {
    const result = useGraphQL({
      fetchOptionsOverride(options) {
        options.url = `http://localhost:${port}`
      },
      loadOnMount,
      operation: { query: '{ echo }' }
    })

    onResult(result)

    return null
  }

  await t.test('Without initial cache', async t => {
    await t.test('`loadOnMount` true (default)', t => {
      t.plan(4)

      const graphql = new GraphQL()

      // eslint-disable-next-line require-jsdoc
      const onResult = ({ load, loading, cacheKey, cacheValue }) => {
        t.type(load, 'function')
        t.equals(loading, true)
        t.type(cacheKey, 'string')
        t.equals(cacheValue, undefined)
        t.end()
      }

      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={graphql}>
          <Component onResult={onResult} />
        </GraphQLContext.Provider>
      )
    })

    await t.test('`loadOnMount` false', t => {
      t.plan(4)

      const graphql = new GraphQL()

      // eslint-disable-next-line require-jsdoc
      const onResult = ({ load, loading, cacheKey, cacheValue }) => {
        t.type(load, 'function')
        t.equals(loading, false)
        t.type(cacheKey, 'string')
        t.equals(cacheValue, undefined)
        t.end()
      }

      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={graphql}>
          <Component loadOnMount={false} onResult={onResult} />
        </GraphQLContext.Provider>
      )
    })
  })

  await t.test('With initial cache', async t => {
    const graphql = new GraphQL()
    const operation = { query: '{ echo }' }

    // eslint-disable-next-line require-jsdoc
    const fetchOptionsOverride = options => {
      options.url = `http://localhost:${port}`
    }

    const { cacheKey: queryCacheKey, cacheValuePromise } = graphql.operate({
      operation,
      fetchOptionsOverride
    })

    const queryCacheValue = await cacheValuePromise
    const { cache } = graphql

    await t.test('`loadOnMount` true (default)', t => {
      t.plan(4)

      const graphql = new GraphQL({ cache })

      // eslint-disable-next-line require-jsdoc
      const onResult = ({ load, loading, cacheKey, cacheValue }) => {
        t.type(load, 'function')
        t.equals(loading, true)
        t.equals(cacheKey, queryCacheKey)
        t.deepEquals(cacheValue, queryCacheValue)
        t.end()
      }

      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={graphql}>
          <Component onResult={onResult} />
        </GraphQLContext.Provider>
      )
    })

    await t.test('`loadOnMount` false', t => {
      t.plan(4)

      const graphql = new GraphQL({ cache })

      // eslint-disable-next-line require-jsdoc
      const onResult = ({ load, loading, cacheKey, cacheValue }) => {
        t.type(load, 'function')
        t.equals(loading, false)
        t.equals(cacheKey, queryCacheKey)
        t.deepEquals(cacheValue, queryCacheValue)
        t.end()
      }

      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={graphql}>
          <Component loadOnMount={false} onResult={onResult} />
        </GraphQLContext.Provider>
      )
    })
  })

  await t.test('GraphQL context missing', t => {
    // eslint-disable-next-line require-jsdoc
    const Component = () => {
      useGraphQL({ operation: { query: '{ echo }' } })
      return null
    }

    t.throws(() => {
      ReactDOMServer.renderToString(<Component />)
    }, new Error('GraphQL context missing.'))

    t.end()
  })

  await t.test('GraphQL context not a GraphQL instance', t => {
    // eslint-disable-next-line require-jsdoc
    const Component = () => {
      useGraphQL({ operation: { query: '{ echo }' } })
      return null
    }

    t.throws(() => {
      ReactDOMServer.renderToString(
        <GraphQLContext.Provider value={false}>
          <Component />
        </GraphQLContext.Provider>
      )
    }, new Error('GraphQL context must be a GraphQL instance.'))

    t.end()
  })
})

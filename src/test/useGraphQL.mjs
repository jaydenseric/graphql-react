import 'cross-fetch/polyfill'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactTestRenderer from 'react-test-renderer'
import t from 'tap'
import { GraphQL } from '../universal/GraphQL'
import { GraphQLContext } from '../universal/GraphQLContext'
import { useGraphQL } from '../universal/useGraphQL'
import { createGraphQLKoaApp } from './helpers/createGraphQLKoaApp'
import { startServer } from './helpers/startServer'

t.test('useGraphQL()', async t => {
  const port = await startServer(t, createGraphQLKoaApp())
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
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
  const { cache: cache1 } = graphql

  // eslint-disable-next-line require-jsdoc, react/prop-types
  const Component = ({ loadOnMount, operationOptions = operation1Options }) => {
    const result = useGraphQL({ loadOnMount, ...operationOptions })
    return JSON.stringify(result)
  }

  await t.test('Without initial cache', async t => {
    await t.test('`loadOnMount` true (default)', t => {
      const graphql = new GraphQL()
      const testRenderer = ReactTestRenderer.create(
        <GraphQLContext.Provider value={graphql}>
          <Component />
        </GraphQLContext.Provider>
      )
      const { loading, cacheKey, cacheValue } = JSON.parse(
        testRenderer.toJSON()
      )

      t.equals(loading, true)
      t.equals(cacheKey, operation1CacheKey)
      t.equals(cacheValue, undefined)
      t.end()
    })

    await t.test('`loadOnMount` false', t => {
      const graphql = new GraphQL()
      const testRenderer = ReactTestRenderer.create(
        <GraphQLContext.Provider value={graphql}>
          <Component loadOnMount={false} />
        </GraphQLContext.Provider>
      )
      const { loading, cacheKey, cacheValue } = JSON.parse(
        testRenderer.toJSON()
      )

      t.equals(loading, false)
      t.equals(cacheKey, operation1CacheKey)
      t.equals(cacheValue, undefined)
      t.end()
    })
  })

  await t.test('With initial cache', async t => {
    await t.test('`loadOnMount` true (default)', t => {
      const graphql = new GraphQL({ cache: cache1 })
      const testRenderer = ReactTestRenderer.create(
        <GraphQLContext.Provider value={graphql}>
          <Component />
        </GraphQLContext.Provider>
      )
      const { loading, cacheKey, cacheValue } = JSON.parse(
        testRenderer.toJSON()
      )

      t.equals(loading, true)
      t.equals(cacheKey, operation1CacheKey)
      t.deepEquals(cacheValue, operation1CacheValue)
      t.end()
    })

    await t.test('`loadOnMount` false', t => {
      const graphql = new GraphQL({ cache: cache1 })
      const testRenderer = ReactTestRenderer.create(
        <GraphQLContext.Provider value={graphql}>
          <Component loadOnMount={false} />
        </GraphQLContext.Provider>
      )
      const { loading, cacheKey, cacheValue } = JSON.parse(
        testRenderer.toJSON()
      )

      t.equals(loading, false)
      t.equals(cacheKey, operation1CacheKey)
      t.deepEquals(cacheValue, operation1CacheValue)
      t.end()
    })
  })

  await t.test('GraphQL context missing', t => {
    t.throws(() => {
      ReactDOMServer.renderToString(<Component />)
    }, new Error('GraphQL context missing.'))

    t.end()
  })

  await t.test('GraphQL context not a GraphQL instance', t => {
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

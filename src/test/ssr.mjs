import 'cross-fetch/dist/node-polyfill.js'
import React from 'react'
import t from 'tap'
import { ssr } from '../server/ssr.mjs'
import { GraphQL } from '../universal/GraphQL.mjs'
import { GraphQLContext } from '../universal/GraphQLContext.mjs'
import { useGraphQL } from '../universal/useGraphQL.mjs'
import { createGraphQLKoaApp } from './helpers/createGraphQLKoaApp.mjs'
import { startServer } from './helpers/startServer.mjs'

t.test('ssr() argument validation', async t => {
  const graphql = new GraphQL()

  await t.test('Argument 1', async t => {
    const error = new Error('ssr() argument 1 must be a GraphQL instance')
    await t.rejects(ssr(), error, 'Rejection error if missing')
    await t.rejects(ssr(true), error, 'Rejection error if wrong type')
  })

  await t.test('Argument 2', async t => {
    const error = new Error('ssr() argument 2 must be a React node')
    await t.rejects(ssr(graphql), error, 'Rejection error if missing')
    await t.resolveMatch(
      ssr(graphql, undefined),
      '',
      'Resolves if undefined is passed'
    )
  })

  await t.test('Argument 3', async t => {
    const error = new Error('ssr() argument 3 must be a function')
    const node = 'a'
    await t.resolveMatch(ssr(graphql, node), node, 'Defaults if missing')
    await t.rejects(
      ssr(graphql, node, false),
      error,
      'Rejection error if wrong type'
    )
  })
})

t.test('ssr() query', async t => {
  const port = await startServer(t, createGraphQLKoaApp())

  // eslint-disable-next-line react/prop-types
  const Component = ({ phrase, children }) => {
    const { loading, cacheValue } = useGraphQL({
      loadOnMount: true,
      operation: { query: `{ echo(phrase: "${phrase}") }` },
      fetchOptionsOverride(options) {
        options.url = `http://localhost:${port}`
      }
    })

    return cacheValue && cacheValue.data ? (
      <>
        <p>{cacheValue.data.echo}</p>
        {children}
      </>
    ) : loading ? (
      'Loading…'
    ) : (
      'Error!'
    )
  }

  await t.test('Single query', async t => {
    const graphql = new GraphQL()
    const html = await ssr(
      graphql,
      <GraphQLContext.Provider value={graphql}>
        <Component phrase="a" />
      </GraphQLContext.Provider>
    )

    t.equals(html, '<p>a</p>', 'Rendered HTML')
  })

  await t.test('Nested query', async t => {
    const graphql = new GraphQL()
    const html = await ssr(
      graphql,
      <GraphQLContext.Provider value={graphql}>
        <Component phrase="a">
          <Component phrase="b" />
        </Component>
      </GraphQLContext.Provider>
    )

    t.equals(html, '<p>a</p><p>b</p>', 'Rendered HTML')
  })
})

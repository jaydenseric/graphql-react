import 'cross-fetch/polyfill'
import test from 'ava'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import { buildSchema } from 'graphql'
import React from 'react'
import { renderToString } from 'react-dom/server'
import PropTypes from 'prop-types'
import gql from 'fake-tag'
import { GraphQL, Provider, Query, preload } from '../lib'

const EPOCH_QUERY = gql`
  {
    epoch {
      iso
    }
  }
`

const YEAR_QUERY = gql`
  query($date: String!) {
    date(isoDate: $date) {
      year
    }
  }
`

const schema = buildSchema(gql`
  type Query {
    date(isoDate: String!): Date!
    epoch: Date!
    daysBetween(isoDateFrom: String!, isoDateTo: String!): Int!
  }

  type Date {
    iso: String!
    year: Int!
  }
`)

const rootValue = {
  date: ({ isoDate }) => new ISODate(isoDate),
  epoch: () => new ISODate(0),
  daysBetween: ({ isoDateFrom, isoDateTo }) =>
    Math.floor((new Date(isoDateTo) - new Date(isoDateFrom)) / 86400000)
}

class ISODate {
  constructor(value) {
    this.date = new Date(value)
  }

  iso() {
    return this.date.toISOString()
  }

  year() {
    return this.date.getFullYear()
  }
}

const app = express()
  .use('/graphql', graphqlHTTP({ schema, rootValue }))
  .use('/bad-payload', (request, response) =>
    response
      .status(200)
      .type('json')
      .send('[{"bad": true}]')
  )
  .use('/bad-json', (request, response) =>
    response
      .status(200)
      .type('txt')
      .send('Not JSON.')
  )
  .use('/404', (request, response) =>
    response
      .status(404)
      .type('txt')
      .send('Not found.')
  )

let port
let server

test.before(
  () =>
    new Promise((resolve, reject) => {
      // Setup the test GraphQL server.
      server = app.listen(error => {
        if (error) reject(error)
        else {
          ;({ port } = server.address())
          resolve()
        }
      })
    })
)

test.serial('Query SSR with fetch unavailable.', async t => {
  const graphql = new GraphQL()

  // Store and delete the global fetch polyfill.
  const { fetch } = global
  delete global.fetch

  // Run the query with fetch unavailable.
  const requestCache = await graphql.query({
    operation: { query: EPOCH_QUERY }
  }).request

  // Restore the global fetch polyfill.
  global.fetch = fetch

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query loadOnMount query={EPOCH_QUERY}>
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with relative fetch URL.', async t => {
  // The relative default fetch options URL causes a fetch error in a server
  // environment.

  const graphql = new GraphQL()
  const requestCache = await graphql.query({
    operation: { query: EPOCH_QUERY }
  }).request

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query loadOnMount query={EPOCH_QUERY}>
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with HTTP error.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/404`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with response JSON invalid.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/bad-json`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with response payload malformed.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/bad-payload`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with GraphQL errors.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/graphql`
  }

  const query = 'x'

  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query }
  }).request

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={query}
      >
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with variables.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/graphql`
  }

  const variables = { date: '2018-01-01' }
  const query = YEAR_QUERY

  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { variables, query }
  }).request

  t.snapshot(requestCache, 'GraphQL request cache.')

  renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        variables={variables}
        query={query}
      >
        {function() {
          t.snapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

test('Query SSR with nested query.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}/graphql`
  }
  const tree = (
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {({
          data: {
            epoch: { iso }
          }
        }) => (
          <Query
            loadOnMount
            fetchOptionsOverride={fetchOptionsOverride}
            variables={{ isoDateFrom: iso }}
            query={gql`
              query($isoDateFrom: String!) {
                daysBetween(isoDateFrom: $isoDateFrom, isoDateTo: "2018-01-01")
              }
            `}
          >
            {result => (
              <pre
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(result)
                }}
              />
            )}
          </Query>
        )}
      </Query>
    </Provider>
  )

  await preload(tree)

  t.snapshot(
    renderToString(tree),
    'HTML displaying the nested query render function argument.'
  )
})

test('Preload legacy React context API components.', async t => {
  class LegacyContextProvider extends React.Component {
    static propTypes = {
      value: PropTypes.string,
      children: PropTypes.node
    }

    static childContextTypes = {
      value: PropTypes.string
    }

    getChildContext() {
      return { value: this.props.value }
    }

    render() {
      return <div>{this.props.children}</div>
    }
  }

  class LegacyContextConsumer extends React.Component {
    static contextTypes = {
      value: PropTypes.string
    }

    render() {
      return <p>{this.context.value}</p>
    }
  }

  const tree = (
    <LegacyContextProvider value="Context value.">
      <div>
        <LegacyContextConsumer />
      </div>
    </LegacyContextProvider>
  )

  t.snapshot(renderToString(tree), 'HTML.')

  await t.notThrows(async () => {
    await preload(tree)
  })
})

test('Cache export & import.', async t => {
  const graphql1 = new GraphQL()

  await graphql1.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}/graphql`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: YEAR_QUERY
    }
  }).request

  const graphql2 = new GraphQL({ cache: graphql1.cache })

  t.is(graphql1.cache, graphql2.cache)
})

test('Cache reset.', async t => {
  const graphql = new GraphQL()

  const {
    fetchOptionsHash: fetchOptionsHash1,
    request: request1
  } = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}/graphql`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: YEAR_QUERY
    }
  })

  await request1

  const cacheBefore = JSON.stringify(graphql.cache)

  const {
    fetchOptionsHash: fetchOptionsHash2,
    request: request2
  } = graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}/graphql`
    },
    variables: { date: '2018-01-02' },
    query: YEAR_QUERY
  })

  await request2

  graphql.onCacheUpdate(fetchOptionsHash1, () => t.fail())

  const request2CacheListener = new Promise(resolve => {
    graphql.onCacheUpdate(fetchOptionsHash2, resolve)
  })

  graphql.reset(fetchOptionsHash1)

  const cacheAfter = JSON.stringify(graphql.cache)

  t.falsy(await request2CacheListener)

  t.is(cacheAfter, cacheBefore)
})

test.after(() =>
  // Close the test GraphQL server.
  server.close()
)

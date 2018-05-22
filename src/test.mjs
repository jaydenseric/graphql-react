import 'cross-fetch/polyfill'
import t from 'tap'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import React from 'react'
import reactDom from 'react-dom/server'
import PropTypes from 'prop-types'
import gql from 'fake-tag'

// https://github.com/graphql/express-graphql/issues/425
import graphql from '../graphql'

import { GraphQL, Provider, Query, preload } from '.'

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

const schema = graphql.buildSchema(gql`
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

const startServer = (t, app) =>
  new Promise((resolve, reject) => {
    app.listen(function(error) {
      if (error) reject(error)
      else {
        t.tearDown(() => this.close())
        resolve(this.address().port)
      }
    })
  })

t.test('Query SSR with fetch unavailable.', async t => {
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

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query loadOnMount query={EPOCH_QUERY}>
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with relative fetch URL.', async t => {
  // The relative default fetch options URL causes a fetch error in a server
  // environment.

  const graphql = new GraphQL()
  const requestCache = await graphql.query({
    operation: { query: EPOCH_QUERY }
  }).request

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query loadOnMount query={EPOCH_QUERY}>
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with HTTP error.', async t => {
  const app = express().use((request, response) =>
    response
      .status(404)
      .type('txt')
      .send('Not found.')
  )
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with response JSON invalid.', async t => {
  const app = express().use((request, response) =>
    response
      .status(200)
      .type('txt')
      .send('Not JSON.')
  )
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with response payload malformed.', async t => {
  const app = express().use((request, response) =>
    response
      .status(200)
      .type('json')
      .send('[{"bad": true}]')
  )
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query: EPOCH_QUERY }
  }).request

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={EPOCH_QUERY}
      >
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with GraphQL errors.', async t => {
  const app = express().use(graphqlHTTP({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const query = 'x'
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { query }
  }).request

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={query}
      >
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with variables.', async t => {
  const app = express().use(graphqlHTTP({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const variables = { date: '2018-01-01' }
  const query = YEAR_QUERY
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation: { variables, query }
  }).request

  t.matchSnapshot(requestCache, 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        variables={variables}
        query={query}
      >
        {function() {
          t.matchSnapshot(arguments, 'Query render function arguments.')
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with nested query.', async t => {
  const app = express().use(graphqlHTTP({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
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

  t.matchSnapshot(
    reactDom.renderToString(tree),
    'HTML displaying the nested query render function argument.'
  )
})

t.test('Preload legacy React context API components.', async t => {
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

  t.matchSnapshot(reactDom.renderToString(tree), 'HTML.')

  await preload(tree)
})

t.test('Cache export & import.', async t => {
  const app = express().use(graphqlHTTP({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql1 = new GraphQL()
  await graphql1.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: YEAR_QUERY
    }
  }).request
  const graphql2 = new GraphQL({ cache: graphql1.cache })

  t.equals(graphql1.cache, graphql2.cache, 'Exported and imported cache match.')
})

t.test('Cache reset.', async t => {
  const app = express().use(graphqlHTTP({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql = new GraphQL()
  const {
    fetchOptionsHash: fetchOptionsHash1,
    request: request1
  } = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}`
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
      options.url = `http://localhost:${port}`
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

  t.notOk(await request2CacheListener, 'On cache update listener didn’t run.')

  t.equals(cacheAfter, cacheBefore, 'Before and after reset cache match.')
})

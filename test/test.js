/* eslint-disable react/prop-types */

import 'cross-fetch/polyfill'
import test from 'ava'
import getPort from 'get-port'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { apolloUploadKoa, GraphQLUpload } from 'apollo-upload-server'
import * as apolloServerKoa from 'apollo-server-koa'
import * as graphqlTools from 'graphql-tools'
import React from 'react'
import { renderToString } from 'react-dom/server'
import render from 'react-test-renderer'
import PropTypes from 'prop-types'
import { GraphQL, Provider, Query, preload } from '../lib'

let port
let server

test.before(async () => {
  // Setup the test GraphQL server.

  const typeDefs = /* GraphQL */ `
    type Query {
      date(isoDate: String!): Date!
      epoch: Date!
      daysBetween(isoDateFrom: String!, isoDateTo: String!): Int!
    }

    scalar Upload

    type Date {
      iso: String!
      day: Int!
      month: Int!
      year: Int!
    }
  `

  const resolvers = {
    Query: {
      date: (obj, { isoDate }) => new Date(isoDate),
      epoch: () => new Date(0),
      daysBetween: (obj, { isoDateFrom, isoDateTo }) =>
        Math.floor((new Date(isoDateTo) - new Date(isoDateFrom)) / 86400000)
    },
    Upload: GraphQLUpload,
    Date: {
      iso: date => date.toISOString(),
      day: date => date.getDate(),
      month: date => date.getMonth(),
      year: date => date.getFullYear()
    }
  }

  const app = new Koa()
    .use(koaBody())
    .use(async (ctx, next) => {
      if (ctx.query.bad === 'json') {
        ctx.status = 200
        ctx.type = 'txt'
        ctx.body = 'Not JSON.'
      } else if (ctx.query.bad === 'payload') {
        ctx.status = 200
        ctx.type = 'json'
        ctx.body = '[{"bad": true}]'
      } else await next()
    })
    .use(apolloUploadKoa())
    .use(
      apolloServerKoa.graphqlKoa({
        schema: graphqlTools.makeExecutableSchema({ typeDefs, resolvers })
      })
    )

  port = await getPort()
  server = await new Promise((resolve, reject) => {
    const server = app.listen(port, error => {
      if (error) reject(error)
      else resolve(server)
    })
  })
})

test('Cache export & import.', async t => {
  const graphql1 = new GraphQL()

  await graphql1.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: /* GraphQL */ `
        query($date: String!) {
          date(isoDate: $date) {
            day
          }
        }
      `
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
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: /* GraphQL */ `
        query($date: String!) {
          date(isoDate: $date) {
            day
          }
        }
      `
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
    query: /* GraphQL */ `
      query($date: String!) {
        date(isoDate: $date) {
          year
        }
      }
    `
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

test('Request cache for valid query.', async t => {
  const graphql = new GraphQL()

  const requestCache = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: /* GraphQL */ `
        query($date: String!) {
          date(isoDate: $date) {
            day
          }
        }
      `
    }
  }).request

  t.snapshot(requestCache)
})

test('Request cache for invalid query.', async t => {
  const graphql = new GraphQL()

  const requestCache = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: 'x'
    }
  }).request

  t.snapshot(requestCache)
})

test('Request cache for response JSON invalid.', async t => {
  const graphql = new GraphQL()

  const { parseError, ...rest } = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}?bad=json`
    },
    operation: {
      query: /* GraphQL */ `
        {
          epoch {
            year
          }
        }
      `
    }
  }).request

  t.is(typeof parseError, 'string')
  t.deepEqual(rest, {})
})

test('Request cache for response payload malformed.', async t => {
  const graphql = new GraphQL()

  const requestCache = await graphql.query({
    fetchOptionsOverride: options => {
      options.url = `http://localhost:${port}?bad=payload`
    },
    operation: {
      query: /* GraphQL */ `
        {
          epoch {
            year
          }
        }
      `
    }
  }).request

  t.snapshot(requestCache)
})

test('Query render.', t => {
  const graphql = new GraphQL()

  const tree = render
    .create(
      <Provider value={graphql}>
        <Query
          loadOnMount
          fetchOptionsOverride={options => {
            options.url = `http://localhost:${port}`
          }}
          variables={{ date: '2018-01-01' }}
          query={
            /* GraphQL */ `
              query($date: String!) {
                date(isoDate: $date) {
                  day
                }
              }
            `
          }
        >
          {result => <div>{JSON.stringify(result)}</div>}
        </Query>
      </Provider>
    )
    .toJSON()
  t.snapshot(tree)
})

test('Server side render nested queries.', async t => {
  const graphql = new GraphQL()
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }
  const tree = (
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        query={
          /* GraphQL */ `
            {
              epoch {
                iso
              }
            }
          `
        }
      >
        {({ data: { epoch: { iso } } }) => (
          <Query
            loadOnMount
            fetchOptionsOverride={fetchOptionsOverride}
            variables={{ isoDateFrom: iso }}
            query={
              /* GraphQL */ `
                query($isoDateFrom: String!) {
                  daysBetween(isoDateFrom: $isoDateFrom, isoDateTo: "2018-01-01")
                }
              `
            }
          >
            {result => JSON.stringify(result)}
          </Query>
        )}
      </Query>
    </Provider>
  )

  await preload(tree)

  t.snapshot(renderToString(tree))
})

test('Preload legacy React context API components.', async t => {
  class LegacyContextProvider extends React.Component {
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

  t.snapshot(renderToString(tree))

  await t.notThrows(async () => {
    await preload(tree)
  })
})

test.after(() =>
  // Close the test GraphQL server.
  server.close()
)

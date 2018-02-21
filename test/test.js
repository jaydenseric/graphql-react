import 'isomorphic-unfetch'
import test from 'ava'
import getPort from 'get-port'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { apolloUploadKoa, GraphQLUpload } from 'apollo-upload-server'
import * as apolloServerKoa from 'apollo-server-koa'
import * as graphqlTools from 'graphql-tools'
import React from 'react'
import render from 'react-test-renderer'
import { GraphQL, Query } from '../lib'

let port
let server

test.before(async () => {
  // Setup the test GraphQL server.

  const typeDefs = `
    type Query {
      date(isoDate: String!): Date!
      epoch: Date!
    }

    scalar Upload

    type Date {
      day: Int!
      month: Int!
      year: Int!
    }
  `

  const resolvers = {
    Query: {
      date: (obj, { isoDate }) => new Date(isoDate),
      epoch: () => new Date(0)
    },
    Upload: GraphQLUpload,
    Date: {
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
  const graphql1 = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  await graphql1.query({
    variables: { date: '2018-06-16' },
    query: `
      query($date: String!){
        date(isoDate: $date) {
          day
        }
      }
    `
  }).request

  const graphql2 = new GraphQL({ cache: graphql1.cache })

  t.is(graphql1.cache, graphql2.cache)
})

test('Request cache for valid query.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const requestCache = await graphql.query({
    variables: { date: '2018-06-16' },
    query: `
      query($date: String!){
        date(isoDate: $date) {
          day
        }
      }
    `
  }).request

  t.snapshot(requestCache)
})

test('Request cache for invalid query.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const requestCache = await graphql.query({
    variables: { date: '2018-01-01' },
    query: 'x'
  }).request

  t.snapshot(requestCache)
})

test('Request cache for response JSON invalid.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}?bad=json`
    }
  })

  const { parseError, ...rest } = await graphql.query({
    query: `
      {
        epoch {
          year
        }
      }
    `
  }).request

  t.is(typeof parseError, 'string')
  t.deepEqual(rest, {})
})

test('Request cache for response payload malformed.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}?bad=payload`
    }
  })

  const requestCache = await graphql.query({
    query: `
      {
        epoch {
          year
        }
      }
    `
  }).request

  t.snapshot(requestCache)
})

test('Query render.', t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const tree = render
    .create(
      <Query
        graphql={graphql}
        variables={{ date: '2018-06-16' }}
        query={`
          query($date: String!){
            date(isoDate: $date) {
              day
            }
          }
        `}
      >
        {result => <div>{JSON.stringify(result)}</div>}
      </Query>
    )
    .toJSON()
  t.snapshot(tree)
})

test.after(() =>
  // Close the test GraphQL server.
  server.close()
)

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
import { Skimp, Query } from '../lib'

let port
let server

test.before(async () => {
  // Setup the test GraphQL server

  const typeDefs = `
    type Query {
      date(isoDate: String!): Date!
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
      date: (obj, { isoDate }) => new Date(isoDate)
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

test('Valid query result.', async t => {
  const skimp = new Skimp({
    request: requestOptions => {
      requestOptions.url = `http://localhost:${port}`
    }
  })

  const {
    // eslint-disable-next-line no-unused-vars
    request,
    ...result
  } = await skimp.query({
    variables: { date: '2018-06-16' },
    query: `
      query($date: String!){
        date(isoDate: $date) {
          day
        }
      }
    `
  })

  t.deepEqual(result, { data: { date: { day: 16 } } })
})

test('Invalid query result.', async t => {
  const skimp = new Skimp({
    request: requestOptions => {
      requestOptions.url = `http://localhost:${port}`
    }
  })

  const {
    // eslint-disable-next-line no-unused-vars
    request,
    ...result
  } = await skimp.query({
    variables: { date: '2018-01-01' },
    query: 'x'
  })

  t.deepEqual(result, {
    httpError: { status: 400, statusText: 'Bad Request' },
    graphQLErrors: [
      {
        message: 'Syntax Error: Unexpected Name "x"',
        locations: [{ line: 1, column: 1 }]
      }
    ]
  })
})

test('Cache export, clear and import.', async t => {
  const skimp = new Skimp({
    request: requestOptions => {
      requestOptions.url = `http://localhost:${port}`
    }
  })

  await skimp.query({
    variables: { date: '2018-06-16' },
    query: `
      query($date: String!){
        date(isoDate: $date) {
          day
        }
      }
    `
  })

  const populatedExport = skimp.exportCache()

  skimp.clearCache()

  const clearedExport = skimp.exportCache()

  t.is(clearedExport, '{}')

  skimp.importCache(populatedExport)

  const repopulatedExport = skimp.exportCache()

  t.is(populatedExport, repopulatedExport)
})

test('Render query', t => {
  const tree = render.create(<Query />).toJSON()
  t.snapshot(tree)
})

test.after(() =>
  // Close the test GraphQL server
  server.close()
)

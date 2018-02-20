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
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const {
    // eslint-disable-next-line no-unused-vars
    request,
    ...result
  } = await graphql.query({
    variables: { date: '2018-06-16' },
    query: `
      query($date: String!){
        date(isoDate: $date) {
          day
        }
      }
    `
  }).request

  t.snapshot(result)
})

test('Invalid query result.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const {
    // eslint-disable-next-line no-unused-vars
    request,
    ...result
  } = await graphql.query({
    variables: { date: '2018-01-01' },
    query: 'x'
  }).request

  t.snapshot(result)
})

test('Export and import.', async t => {
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

test('Render query', t => {
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

/* eslint-disable react/prop-types */

import 'isomorphic-unfetch'
import test from 'ava'
import getPort from 'get-port'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { apolloUploadKoa, GraphQLUpload } from 'apollo-upload-server'
import * as apolloServerKoa from 'apollo-server-koa'
import * as graphqlTools from 'graphql-tools'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import render from 'react-test-renderer'
import { GraphQL, Provider, Query } from '../lib'
import { recurseReactElement, preload } from '../lib/server'

let port
let server

test.before(async () => {
  // Setup the test GraphQL server.

  const typeDefs = /* GraphQL */ `
    type Query {
      date(isoDate: String!): Date!
      epoch: Date!
      daysSince(isoDate: String!): Int!
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
      daysSince: (obj, { isoDate }) =>
        Math.floor((new Date() - new Date(isoDate)) / 86400000)
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
  const graphql1 = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  await graphql1.query({
    variables: { date: '2018-06-16' },
    query: /* GraphQL */ `
      query($date: String!) {
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
    query: /* GraphQL */ `
      query($date: String!) {
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
    query: /* GraphQL */ `
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
    query: /* GraphQL */ `
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
      <Provider value={graphql}>
        <Query
          loadOnMount
          variables={{ date: '2018-06-16' }}
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

test('recurseReactElement recurses a complex ReactElement tree.', t => {
  const { Provider, Consumer } = React.createContext()

  class ClassComponent extends React.Component {
    componentWillMount() {
      this.setState({ string: 'a' })
      this.setState((state, props) => ({ number: props.number }))
    }

    render() {
      return (
        <React.Fragment>
          {this.state.string} {this.state.number}
          <div>{this.props.children}</div>
        </React.Fragment>
      )
    }
  }

  const FunctionComponent = ({ children }) => children

  const tree = (
    <Provider value={1}>
      {[
        <div key="1">
          <Consumer>
            {contextValue => (
              <ClassComponent number={contextValue}>
                <FunctionComponent>
                  <div />
                </FunctionComponent>
              </ClassComponent>
            )}
          </Consumer>
        </div>
      ]}
    </Provider>
  )

  let visitedElementCount = 0
  recurseReactElement(tree, () => {
    visitedElementCount++
    return true
  })

  t.is(visitedElementCount, 10)
})

test('Server side render nested queries.', async t => {
  const graphql = new GraphQL({
    requestOptions: options => {
      options.url = `http://localhost:${port}`
    }
  })

  const tree = (
    <Provider value={graphql}>
      <Query
        loadOnMount
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
            variables={{ date: iso }}
            query={
              /* GraphQL */ `
              query($date: String!) {
                daysSince(isoDate: $date)
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

  await preload(tree, graphql)

  t.snapshot(ReactDOMServer.renderToString(tree))
})

test.after(() =>
  // Close the test GraphQL server.
  server.close()
)

import test from 'ava'
import getPort from 'get-port'
import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { apolloUploadKoa, GraphQLUpload } from 'apollo-upload-server'
import graphqlServerKoa from 'graphql-server-koa'
import graphqlTools from 'graphql-tools'
// import { Skimp } from '.'

let port
let server

// Start the test GraphQL server
test.before(async () => {
  port = await getPort()
  const app = new Koa()

  const typeDefs = `
    type Query {}
    type Mutation {}
    scalar Upload
  `

  const resolvers = {
    Query: {},
    Mutation: {},
    Upload: GraphQLUpload
  }

  const schema = graphqlTools.makeExecutableSchema({ typeDefs, resolvers })

  app.use(koaBody(), apolloUploadKoa(), graphqlServerKoa.graphqlKoa({ schema }))

  server = app.listen(port)
})

// Close the test GraphQL server
test.after(() => server.close())

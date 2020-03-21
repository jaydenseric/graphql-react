import graphqlApiKoa from 'graphql-api-koa'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import graphql from './graphql.js'

const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = graphql

/**
 * Creates a GraphQL Koa app.
 * @param {object} fields GraphQL `query` fields.
 * @returns {object} Koa instance.
 */
export const createGraphQLKoaApp = (
  fields = {
    echo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        phrase: {
          type: GraphQLString,
          defaultValue: 'hello'
        }
      },
      resolve: (root, { phrase }) => phrase
    }
  }
) =>
  new Koa()
    .use(graphqlApiKoa.errorHandler())
    .use(bodyParser())
    .use(
      graphqlApiKoa.execute({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields
          })
        })
      })
    )

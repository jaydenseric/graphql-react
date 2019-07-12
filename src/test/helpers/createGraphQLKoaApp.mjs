import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql'
import { errorHandler, execute } from 'graphql-api-koa'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

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
    .use(errorHandler())
    .use(bodyParser())
    .use(
      execute({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields
          })
        })
      })
    )

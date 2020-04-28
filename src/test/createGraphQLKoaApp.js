'use strict';

const { errorHandler, execute } = require('graphql-api-koa');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('./graphql.js');

/**
 * Creates a GraphQL Koa app.
 * @param {object} fields GraphQL `query` fields.
 * @returns {object} Koa instance.
 * @ignore
 */
module.exports = function createGraphQLKoaApp(
  fields = {
    echo: {
      type: GraphQLNonNull(GraphQLString),
      args: {
        phrase: {
          type: GraphQLString,
          defaultValue: 'hello',
        },
      },
      resolve: (root, { phrase }) => phrase,
    },
  }
) {
  return new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(
      execute({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields,
          }),
        }),
      })
    );
};

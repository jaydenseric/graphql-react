// https://github.com/graphql/express-graphql/issues/425
// https://github.com/babel/babel/issues/7998

const {
  // eslint-disable-next-line no-unused-vars
  __esModule,
  ...graphql
} = require('graphql')

module.exports = graphql

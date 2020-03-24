'use strict'

// This module is a workaround for a Node.js ESM/CJS interoperability Babel bug:
// https://github.com/babel/babel/issues/7998

const {
  // eslint-disable-next-line no-unused-vars
  __esModule,
  ...graphql
} = require('graphql')

module.exports = graphql

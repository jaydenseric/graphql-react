'use strict';

const React = require('react');

/**
 * [React context object](https://reactjs.org/docs/context#api) for a
 * [`GraphQL`]{@link GraphQL} instance.
 * @kind constant
 * @name GraphQLContext
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context#contextconsumer).
 * @see [`GraphQLProvider`]{@link GraphQLProvider} is used to provide this context.
 * @see [`useGraphQL`]{@link useGraphQL} React hook requires an ancestor [`GraphQLContext`]{@link GraphQLContext} `Provider` to work.
 * @example <caption>A button component that resets the [GraphQL cache]{@link GraphQL#cache}.</caption>
 * ```jsx
 * import React from 'react'
 * import { GraphQLContext } from 'graphql-react'
 *
 * const ResetCacheButton = () => {
 *   const graphql = React.useContext(GraphQLContext)
 *   return <button onClick={graphql.reset}>Reset cache</button>
 * }
 * ```
 */
const GraphQLContext = React.createContext();

GraphQLContext.displayName = 'GraphQLContext';

module.exports = GraphQLContext;

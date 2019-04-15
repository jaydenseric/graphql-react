import React from 'react'

/**
 * [React context object](https://reactjs.org/docs/context#api) for a
 * [`GraphQL`]{@link GraphQL} instance.
 * @kind constant
 * @name GraphQLContext
 * @type {Object}
 * @prop {function} Provider [React context provider component](https://reactjs.org/docs/context#contextprovider). Enables use of the [`useGraphQL`]{@link useGraphQL} hook in descendant components.
 * @prop {function} Consumer [React context consumer component](https://reactjs.org/docs/context#contextconsumer).
 * @see [`useGraphQL`]{@link useGraphQL} React hook requires a [`GraphQLContext`]{@link GraphQLContext} `Provider` to work.
 * @example <caption>Provide a [`GraphQL`]{@link GraphQL} instance for an app.</caption>
 * ```jsx
 * import { GraphQL, GraphQLContext } from 'graphql-react'
 *
 * const graphql = new GraphQL()
 *
 * const App = ({ children }) => (
 *   <GraphQLContext.Provider value={graphql}>
 *     {children}
 *   </GraphQLContext.Provider>
 * )
 * ```
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
export const GraphQLContext = React.createContext()

GraphQLContext.displayName = 'GraphQLContext'

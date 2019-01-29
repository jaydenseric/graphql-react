import React from 'react'

const GraphQLContext = React.createContext()

GraphQLContext.displayName = 'GraphQLContext'

export const {
  /**
   * A React component that provides a [`GraphQL`]{@link GraphQL} instance in
   * context for nested [`Consumer`]{@link Consumer} components to use.
   * @kind function
   * @name Provider
   * @param {GraphQL} value A [`GraphQL`]{@link GraphQL} instance.
   * @param {ReactNode} children A React node.
   * @returns {ReactNode} React virtual DOM node.
   * @example <caption>Using the `Provider` component for a page.</caption>
   * ```jsx
   * import { GraphQL, Provider } from 'graphql-react'
   *
   * const graphql = new GraphQL()
   *
   * const Page = () => (
   *   <Provider value={graphql}>Use Consumer or Query components…</Provider>
   * )
   * ```
   */
  Provider,

  /**
   * A React component that gets the [`GraphQL`]{@link GraphQL} instance from
   * context.
   * @kind function
   * @name Consumer
   * @param {ConsumerRender} children Render function that receives a [`GraphQL`]{@link GraphQL} instance.
   * @returns {ReactNode} React virtual DOM node.
   * @example <caption>A button component that resets the [GraphQL cache]{@link GraphQL#cache}.</caption>
   * ```jsx
   * import { Consumer } from 'graphql-react'
   *
   * const ResetCacheButton = () => (
   *   <Consumer>
   *     {graphql => <button onClick={graphql.reset}>Reset cache</button>}
   *   </Consumer>
   * )
   * ```
   */
  Consumer
} = GraphQLContext

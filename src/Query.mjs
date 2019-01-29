import propTypes from 'prop-types'
import React from 'react'
import { Consumer } from './GraphQLContext'
import { GraphQLQuery } from './GraphQLQuery'

/**
 * A React component to manage a GraphQL query or mutation.
 * @kind function
 * @name Query
 * @param {Object} props Component props.
 * @param {GraphQLOperation} props.operation GraphQL operation.
 * @param {FetchOptionsOverride} [props.fetchOptionsOverride] Overrides default GraphQL request [fetch options]{@link FetchOptions}.
 * @param {boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {boolean} [props.loadOnReset=false] Should the query load when the [GraphQL cache]{@link GraphQL#cache} is reset.
 * @param {boolean} [props.resetOnLoad=false] Should the [GraphQL cache]{@link GraphQL#cache} reset when the query loads.
 * @param {QueryRender} props.children Renders the query status.
 * @returns {ReactNode} React virtual DOM node.
 * @example <caption>A query to display a user profile.</caption>
 * ```jsx
 * import { Query } from 'graphql-react'
 *
 * const Profile = ({ userId }) => (
 *   <Query
 *     loadOnMount
 *     loadOnReset
 *     fetchOptionsOverride={options => {
 *      options.url = 'https://api.example.com/graphql'
 *     }}
 *     operation={
 *       variables: { userId },
 *       query: `
 *         query user($userId: ID!) {
 *           user(userId: $userId) {
 *             name
 *           }
 *         }
 *       `
 *     }
 *   >
 *     {({
 *       load,
 *       loading,
 *       fetchError,
 *       httpError,
 *       parseError,
 *       graphQLErrors,
 *       data
 *     }) => (
 *       <article>
 *         <button onClick={load}>Reload</button>
 *         {loading && <span>Loading…</span>}
 *         {(fetchError || httpError || parseError || graphQLErrors) && (
 *           <strong>Error!</strong>
 *         )}
 *         {data && <h1>{data.user.name}</h1>}
 *       </article>
 *     )}
 *   </Query>
 * )
 * ```
 * @example <caption>A mutation to clap an article.</caption>
 * ```jsx
 * import { Query } from 'graphql-react'
 *
 * const ClapArticleButton = ({ articleId }) => (
 *   <Query
 *     resetOnLoad
 *     fetchOptionsOverride={options => {
 *       options.url = 'https://api.example.com/graphql'
 *     }}
 *     operation={
 *       variables: { articleId },
 *       query: `
 *         mutation clapArticle($articleId: ID!) {
 *           clapArticle(articleId: $articleId) {
 *             clapCount
 *           }
 *         }
 *       `
 *     }
 *   >
 *     {({
 *       load,
 *       loading,
 *       fetchError,
 *       httpError,
 *       parseError,
 *       graphQLErrors,
 *       data
 *     }) => (
 *       <aside>
 *         <button onClick={load} disabled={loading}>
 *           Clap
 *         </button>
 *         {(fetchError || httpError || parseError || graphQLErrors) && (
 *           <strong>Error!</strong>
 *         )}
 *         {data && <p>Clapped {data.clapArticle.clapCount} times.</p>}
 *       </aside>
 *     )}
 *   </Query>
 * )
 * ```
 */
export const Query = props => (
  <Consumer>
    {graphql => {
      if (!graphql) throw new Error('GraphQL context provider missing.')
      return <GraphQLQuery graphql={graphql} {...props} />
    }}
  </Consumer>
)

Query.propTypes = {
  fetchOptionsOverride: propTypes.func,
  operation: propTypes.object.isRequired,
  loadOnMount: propTypes.bool,
  loadOnReset: propTypes.bool,
  resetOnLoad: propTypes.bool,
  children: propTypes.func.isRequired
}

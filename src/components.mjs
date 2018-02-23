import React from 'react'
import propTypes from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

export const {
  Provider: GraphQLProvider,
  Consumer: GraphQLConsumer
} = React.createContext()

/**
 * A React component to manage a GraphQL query.
 * @ignore
 * @param {Object} props Component props.
 * @param {GraphQL} props.graphql GraphQL client instance.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=true] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=true] Should the query load when the GraphQL client cache is reset.
 * @param {Boolean} [props.resetOnLoad=false] Should the GraphQL client cache reset when the query loads.
 * @param {Function} children Render function.
 */
export class Query extends React.Component {
  constructor(props) {
    super(props)
    this.validateProps()
    this.state = { loading: props.loadOnMount }
  }

  static propTypes = {
    graphql: propTypes.instanceOf(GraphQL).isRequired,
    variables: propTypes.object,
    query: propTypes.string.isRequired,
    loadOnMount: propTypes.bool,
    loadOnReset: propTypes.bool,
    resetOnLoad: propTypes.bool,
    children: propTypes.func.isRequired
  }

  static defaultProps = {
    loadOnMount: true,
    loadOnReset: true,
    resetOnLoad: false
  }

  /**
   * Validates the props for conflicts.
   * @private
   */
  validateProps = () => {
    if (this.props.loadOnReset && this.props.resetOnLoad)
      throw new Error('Conflicting “loadOnReset” and “resetOnLoad” props.')
  }

  /**
   * Handles request cache updates.
   * @private
   * @param {RequestCache} requestCache Request cache.
   */
  handleCacheUpdate = requestCache => {
    if (
      // Cache has been reset and…
      !requestCache &&
      // …the component is to load on reset cache.
      this.props.loadOnReset
    )
      this.load()
    else this.setState({ requestCache })
  }

  /**
   * Loads the query.
   */
  load = () => {
    const { pastRequestCache, requestHash, request } = this.props.graphql.query(
      { variables: this.props.variables, query: this.props.query }
    )

    if (
      // Either it’s the initial load or a past request has changed.
      this.state.requestHash !== requestHash
    ) {
      if (
        // A past request has changed.
        this.state.requestHash
      )
        // Remove the redundant request cache listener.
        this.props.graphql.offCacheUpdate(
          this.state.requestHash,
          this.handleCacheUpdate
        )

      // Listen for changes to the request cache.
      this.props.graphql.onCacheUpdate(requestHash, this.handleCacheUpdate)
    }

    const stateUpdate = { requestHash, loading: true }

    if (pastRequestCache)
      // Use past cache for this request during load. It might not already
      // be in state if the request was cached via another component.
      stateUpdate.requestCache = pastRequestCache

    this.setState(stateUpdate, () =>
      request.then(() => {
        // Request done. Elsewhere a cache listener updates the state cache.
        this.setState({ loading: false }, () => {
          if (this.props.resetOnLoad) this.props.graphql.reset()
        })
      })
    )
  }

  componentDidMount() {
    if (this.props.loadOnMount) this.load()
  }

  componentDidUpdate({ query, variables }) {
    this.validateProps()

    if (
      // Load on cache reset enabled and…
      this.props.loadOnReset &&
      // …a load has happened before and…
      this.state.requestHash &&
      // …props that may affect the cache have changed.
      (query !== this.props.query || !equal(variables, this.props.variables))
    )
      this.load()
  }

  componentWillUnmount() {
    if (this.state.requestHash)
      this.props.graphql.offCacheUpdate(
        this.state.requestHash,
        this.handleCacheUpdate
      )
  }

  render() {
    return this.props.children({
      load: this.load,
      loading: this.state.loading,
      ...this.state.requestCache
    })
  }
}

/**
 * A React component to manage a GraphQL mutation.
 * @ignore
 * @param {Object} props Component props.
 * @param {GraphQL} props.graphql GraphQL client instance.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=false] Should the query load when the GraphQL client cache is reset.
 * @param {Boolean} [props.resetOnLoad=true] Should the GraphQL client cache reset when the query loads.
 * @param {Function} children Render function.
 */
export class Mutation extends Query {
  static defaultProps = {
    loadOnMount: false,
    loadOnReset: false,
    resetOnLoad: true
  }
}

/**
 * A React component to manage a GraphQL query.
 * @param {Object} props Component props.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=true] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=true] Should the query load when the GraphQL client cache is reset.
 * @param {Boolean} [props.resetOnLoad=false] Should the GraphQL client cache reset when the query loads.
 * @param {Function} children Render function.
 * @returns {String} HTML.
 * @example
 * import { GraphQLQuery } from 'graphql-react'
 *
 * const Profile = ({ userId }) => (
 *   <GraphQLQuery
 *     variables={{ userId }}
 *     query={`
 *       query user($userId: ID!) {
 *         user(userId: $id) {
 *           name
 *         }
 *       }
 *     `}
 *   >
 *     {({ load, loading, httpError, parseError, graphQLErrors, data }) => (
 *       <article>
 *         {loading && <span>Loading…</span>}
 *         {(httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *         {data && <h1>{data.user.name}</h1>}
 *         <button onClick={load} disabled={loading}>
 *           Reload
 *         </button>
 *       </article>
 *     )}
 *   </GraphQLQuery>
 * )
 */
export const GraphQLQuery = props => (
  <GraphQLConsumer>
    {graphql => <Query graphql={graphql} {...props} />}
  </GraphQLConsumer>
)

/**
 * A React component to manage a GraphQL mutation. The same as
 * {@link GraphQLQuery} but with different default props.
 * @param {Object} props Component props.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=false] Should the query load when the GraphQL client cache is reset.
 * @param {Boolean} [props.resetOnLoad=true] Should the GraphQL client cache reset when the query loads.
 * @param {Function} children Render function.
 * @returns {String} HTML.
 * @example
 * import { GraphQLMutation } from 'graphql-react'
 *
 * const ClapArticleButton = ({ articleId }) => (
 *   <GraphQLMutation
 *     variables={{ articleId }}
 *     query={`
 *       mutation clapArticle($articleId: ID!) {
 *         clapArticle(articleId: $id) {
 *           clapCount
 *         }
 *       }
 *     `}
 *   >
 *     {({ load, loading, httpError, parseError, graphQLErrors, data }) => (
 *       <aside>
 *         {(httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *         {data && <p>Clapped {data.clapArticle.clapCount} times.</p>}
 *         <button onClick={load} disabled={loading}>
 *           Clap
 *         </button>
 *       </aside>
 *     )}
 *   </GraphQLMutation>
 * )
 */
export const GraphQLMutation = props => (
  <GraphQLConsumer>
    {graphql => <Mutation graphql={graphql} {...props} />}
  </GraphQLConsumer>
)

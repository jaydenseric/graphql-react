import React from 'react'
import propTypes from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

export const {
  /**
   * A React component that puts a {@link GraphQL} instance in context for
   * nested {@link Consumer} components to use.
   * @function
   * @param {GraphQL} value A {@link GraphQL} instance.
   * @param {ReactNode} children A React node.
   * @returns {ReactElement} React virtual DOM element.
   * @example
   * import { GraphQL, Provider } from 'graphql-react'
   *
   * const graphql = new GraphQL()
   *
   * const Page = () => (
   *   <Provider value={graphql}>Use Consumer or Query components…</Provider>
   * )
   */
  Provider,

  /**
   * A React component that gets the {@link GraphQL} instance from context.
   * @function
   * @param {ConsumerRender} children Render function that receives a {@link GraphQL} instance.
   * @returns {ReactElement} React virtual DOM element.
   * @example <caption>A button component that resets the {@link GraphQL} cache.</caption>
   * import { Consumer } from 'graphql-react'
   *
   * const ResetCacheButton = () => (
   *   <Consumer>
   *     {graphql => <button onClick={graphql.reset}>Reset cache</button>}
   *   </Consumer>
   * )
   */
  Consumer
} = React.createContext()

/**
 * Renders a {@link GraphQL} consumer.
 * @typedef {Function} ConsumerRender
 * @param {GraphQL} graphql {@link GraphQL} instance.
 * @returns {ReactElement} React virtual DOM element.
 * @example <caption>A button that resets the {@link GraphQL} cache.</caption>
 * graphql => <button onClick={graphql.reset}>Reset cache</button>
 */

/**
 * A React component to manage a GraphQL query with a {@link GraphQL} instance.
 * See {@link Query}, which takes the {@link GraphQL} instance from context
 * instead of a prop.
 * @ignore
 * @param {Object} props Component props.
 * @param {GraphQL} props.graphql {@link GraphQL} instance.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=false] Should the query load when the {@link GraphQL} cache is reset.
 * @param {Boolean} [props.resetOnLoad=false] Should the {@link GraphQL} cache reset when the query loads.
 * @param {RenderQuery} children Renders the query status.
 */
class GraphQLQuery extends React.Component {
  constructor(props) {
    super(props)

    this.validateProps()

    this.state = { loading: props.loadOnMount }

    if (props.loadOnMount) {
      this.state.requestHash = props.graphql.constructor.hashRequestOptions(
        props.graphql.getRequestOptions(this.operation())
      )
      this.state.requestCache = props.graphql.cache[this.state.requestHash]

      // Listen for changes to the request cache.
      this.props.graphql.onCacheUpdate(
        this.state.requestHash,
        this.handleCacheUpdate
      )
    }
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
   * Derives the GraphQL operation.
   * @returns {Operation} GraphQL operation object.
   */
  operation = () => ({
    variables: this.props.variables,
    query: this.props.query
  })

  /**
   * Loads the query, updating cache.
   * @returns {RequestCachePromise} Promise that resolves the request cache.
   */
  load = () => {
    const stateUpdate = { loading: true }
    const { pastRequestCache, requestHash, request } = this.props.graphql.query(
      this.operation()
    )

    if (
      // The request hash has changed…
      requestHash !== this.state.requestHash
    ) {
      stateUpdate.requestHash = requestHash

      // Stop listening for the old request cache updates.
      this.props.graphql.offCacheUpdate(
        this.state.requestHash,
        this.handleCacheUpdate
      )

      // Listen for the new request cache updates.
      this.props.graphql.onCacheUpdate(requestHash, this.handleCacheUpdate)
    }

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

    return request
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

  /**
   * Renders the component.
   * @returns {ReactElement} React virtual DOM element.
   */
  render() {
    return this.props.children({
      load: this.load,
      loading: this.state.loading,
      ...this.state.requestCache
    })
  }
}

/**
 * A React component to manage a GraphQL query or mutation.
 * @param {Object} props Component props.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {String} props.query GraphQL query.
 * @param {Boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {Boolean} [props.loadOnReset=false] Should the query load when the {@link GraphQL} cache is reset.
 * @param {Boolean} [props.resetOnLoad=false] Should the {@link GraphQL} cache reset when the query loads.
 * @param {QueryRender} children Renders the query status.
 * @returns {ReactElement} React virtual DOM element.
 * @example <caption>A query to display a user profile.</caption>
 * import { Query } from 'graphql-react'
 *
 * const Profile = ({ userId }) => (
 *   <Query
 *     loadOnMount
 *     loadOnReset
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
 *         <button onClick={load}>Reload</button>
 *         {loading && <span>Loading…</span>}
 *         {(httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *         {data && <h1>{data.user.name}</h1>}
 *       </article>
 *     )}
 *   </Query>
 * )
 * @example <caption>A mutation to clap an article.</caption>
 * import { Query } from 'graphql-react'
 *
 * const ClapArticleButton = ({ articleId }) => (
 *   <Query
 *     resetOnLoad
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
 *         <button onClick={load} disabled={loading}>Clap</button>
 *         {(httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *         {data && <p>Clapped {data.clapArticle.clapCount} times.</p>}
 *       </aside>
 *     )}
 *   </Query>
 * )
 */
export const Query = props => (
  <Consumer>
    {graphql => <GraphQLQuery graphql={graphql} {...props} />}
  </Consumer>
)

Query.propTypes = {
  variables: propTypes.object,
  query: propTypes.string.isRequired,
  loadOnMount: propTypes.bool,
  loadOnReset: propTypes.bool,
  resetOnLoad: propTypes.bool,
  children: propTypes.func.isRequired
}

/**
 * Renders the status of a query or mutation.
 * @typedef {Function} QueryRender
 * @param {Function} load Loads the query on demand, updating cache.
 * @param {Boolean} loading Is the query loading.
 * @param {HTTPError} [httpError] Fetch HTTP error.
 * @param {String} [parseError] Parse error message.
 * @param {Object} [graphQLErrors] GraphQL response errors.
 * @param {Object} [data] GraphQL response data.
 * @returns {ReactElement} React virtual DOM element.
 * @example
 * ({ load, loading, httpError, parseError, graphQLErrors, data }) => (
 *   <aside>
 *     <button onClick={load}>Reload</button>
 *     {loading && <span>Loading…</span>}
 *     {(httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *     {data && <h1>{data.user.name}</h1>}
 *   </aside>
 * )
 */

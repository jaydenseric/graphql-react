import React from 'react'
import propTypes from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

export const {
  /**
   * A React component provides a [`GraphQL`]{@link GraphQL} instance in context for nested
   * [`Consumer`]{@link Consumer} components to use.
   * @function
   * @param {GraphQL} value A [`GraphQL`]{@link GraphQL} instance.
   * @param {ReactNode} children A React node.
   * @returns {ReactElement} React virtual DOM element.
   * @example
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
   * A React component that gets the [`GraphQL`]{@link GraphQL} instance from context.
   * @function
   * @param {ConsumerRender} children Render function that receives a [`GraphQL`]{@link GraphQL} instance.
   * @returns {ReactElement} React virtual DOM element.
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
} = React.createContext()

/**
 * Renders a [`GraphQL`]{@link GraphQL} consumer.
 * @kind typedef
 * @name ConsumerRender
 * @type {function}
 * @param {GraphQL} graphql [`GraphQL`]{@link GraphQL} instance.
 * @returns {ReactElement} React virtual DOM element.
 * @example <caption>A button that resets the [GraphQL cache]{@link GraphQL#cache}.</caption>
 * ```jsx
 * graphql => <button onClick={graphql.reset}>Reset cache</button>
 * ```
 */

/**
 * A React component to manage a GraphQL query with a [`GraphQL`]{@link GraphQL} instance.
 * See also the [`Query`]{@link Query} component, which takes the [`GraphQL`]{@link GraphQL}
 * instance from context instead of a prop.
 * @kind class
 * @name GraphQLQuery
 * @param {Object} props Component props.
 * @param {GraphQL} props.graphql [`GraphQL`]{@link GraphQL} instance.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {string} props.query GraphQL query.
 * @param {FetchOptionsOverride} [props.fetchOptionsOverride] Overrides default fetch options for the GraphQL request.
 * @param {boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {boolean} [props.loadOnReset=false] Should the query load when its [GraphQL cache]{@link GraphQL#cache} entry is reset.
 * @param {boolean} [props.resetOnLoad=false] Should all other [GraphQL cache]{@link GraphQL#cache} reset when the query loads.
 * @param {QueryRender} props.children Renders the query status.
 */
class GraphQLQuery extends React.Component {
  static propTypes = {
    graphql: propTypes.instanceOf(GraphQL).isRequired,
    fetchOptionsOverride: propTypes.func,
    variables: propTypes.object,
    query: propTypes.string.isRequired,
    loadOnMount: propTypes.bool,
    loadOnReset: propTypes.bool,
    resetOnLoad: propTypes.bool,
    children: propTypes.func.isRequired
  }

  // eslint-disable-next-line
  constructor(props) {
    super(props)

    this.state = { loading: props.loadOnMount }

    if (props.loadOnMount) {
      const fetchOptions = props.graphql.constructor.fetchOptions(
        this.operation()
      )

      if (props.fetchOptionsOverride) props.fetchOptionsOverride(fetchOptions)

      this.state.fetchOptionsHash = props.graphql.constructor.hashFetchOptions(
        fetchOptions
      )

      this.state.requestCache = props.graphql.cache[this.state.fetchOptionsHash]

      // Listen for changes to the request cache.
      this.props.graphql.onCacheUpdate(
        this.state.fetchOptionsHash,
        this.handleCacheUpdate
      )
    }
  }

  /**
   * Handles [request cache]{@link RequestCache} updates.
   * @kind function
   * @name GraphQLQuery#handleCacheUpdate
   * @param {RequestCache} requestCache Request cache.
   * @ignore
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
   * @kind function
   * @name GraphQLQuery#operation
   * @returns {Operation} GraphQL operation object.
   * @ignore
   */
  operation = () => ({
    variables: this.props.variables,
    query: this.props.query
  })

  /**
   * Loads the query, updating cache.
   * @kind function
   * @name GraphQLQuery#load
   * @returns {RequestCachePromise} A promise that resolves the [request cache]{@link RequestCache}.
   */
  load = () => {
    const stateUpdate = { loading: true }
    const { fetchOptionsHash, cache, request } = this.props.graphql.query({
      operation: this.operation(),
      fetchOptionsOverride: this.props.fetchOptionsOverride,
      resetOnLoad: this.props.resetOnLoad
    })

    if (
      // The fetch options hash has changed…
      fetchOptionsHash !== this.state.fetchOptionsHash
    ) {
      stateUpdate.fetchOptionsHash = fetchOptionsHash

      // Stop listening for the old request cache updates.
      this.props.graphql.offCacheUpdate(
        this.state.fetchOptionsHash, // Old hash.
        this.handleCacheUpdate
      )

      // Listen for the new request cache updates.
      this.props.graphql.onCacheUpdate(
        fetchOptionsHash, // New hash.
        this.handleCacheUpdate
      )
    }

    if (cache)
      // Use past cache for this request during load. It might not already
      // be in state if the request was cached via another component.
      stateUpdate.requestCache = cache

    this.setState(stateUpdate, () =>
      request.then(() =>
        // Request done. Elsewhere a cache listener updates the state cache.
        this.setState({ loading: false })
      )
    )

    return request
  }

  /**
   * Invoked after the React component mounts.
   * @kind function
   * @name GraphQLQuery#componentDidMount
   * @ignore
   */
  componentDidMount() {
    if (this.props.loadOnMount) this.load()
  }

  /**
   * Invoked after the React component updates.
   * @kind function
   * @name GraphQLQuery#componentDidUpdate
   * @ignore
   */
  componentDidUpdate({ query, variables }) {
    if (
      // Load on cache reset enabled and…
      this.props.loadOnReset &&
      // …a load has happened before and…
      this.state.fetchOptionsHash &&
      // …props that may affect the cache have changed.
      (query !== this.props.query || !equal(variables, this.props.variables))
    )
      this.load()
  }

  /**
   * Invoked before the React component is unmounted and destroyed.
   * @kind function
   * @name GraphQLQuery#componentWillUnmount
   * @ignore
   */
  componentWillUnmount() {
    if (this.state.fetchOptionsHash)
      this.props.graphql.offCacheUpdate(
        this.state.fetchOptionsHash,
        this.handleCacheUpdate
      )
  }

  /**
   * Renders the component.
   * @kind function
   * @name GraphQLQuery#render
   * @returns {ReactElement} React virtual DOM element.
   * @ignore
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
 * @kind function
 * @name Query
 * @param {Object} props Component props.
 * @param {Object} [props.variables] GraphQL query variables.
 * @param {string} props.query GraphQL query.
 * @param {FetchOptionsOverride} [props.fetchOptionsOverride] Overrides default GraphQL request [fetch options]{@link FetchOptions}.
 * @param {boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {boolean} [props.loadOnReset=false] Should the query load when the [GraphQL cache]{@link GraphQL#cache} is reset.
 * @param {boolean} [props.resetOnLoad=false] Should the [GraphQL cache]{@link GraphQL#cache} reset when the query loads.
 * @param {QueryRender} props.children Renders the query status.
 * @returns {ReactElement} React virtual DOM element.
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
 *     variables={{ userId }}
 *     query={`
 *       query user($userId: ID!) {
 *         user(userId: $id) {
 *           name
 *         }
 *       }
 *     `}
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
 *     variables={{ articleId }}
 *     query={`
 *       mutation clapArticle($articleId: ID!) {
 *         clapArticle(articleId: $id) {
 *           clapCount
 *         }
 *       }
 *     `}
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
    {graphql => <GraphQLQuery graphql={graphql} {...props} />}
  </Consumer>
)

Query.propTypes = {
  fetchOptionsOverride: propTypes.func,
  variables: propTypes.object,
  query: propTypes.string.isRequired,
  loadOnMount: propTypes.bool,
  loadOnReset: propTypes.bool,
  resetOnLoad: propTypes.bool,
  children: propTypes.func.isRequired
}

/**
 * Renders the status of a query or mutation.
 * @kind typedef
 * @name QueryRender
 * @type {function}
 * @param {function} load Loads the query on demand, updating cache.
 * @param {boolean} loading Is the query loading.
 * @param {string} [fetchError] Fetch error message.
 * @param {HttpError} [httpError] Fetch response HTTP error.
 * @param {string} [parseError] Parse error message.
 * @param {Object} [graphQLErrors] GraphQL response errors.
 * @param {Object} [data] GraphQL response data.
 * @returns {ReactElement} React virtual DOM element.
 * @example
 * ```jsx
 * ({ load, loading, fetchError, httpError, parseError, graphQLErrors, data }) => (
 *   <aside>
 *     <button onClick={load}>Reload</button>
 *     {loading && <span>Loading…</span>}
 *     {(fetchError || httpError || parseError || graphQLErrors) && <strong>Error!</strong>}
 *     {data && <h1>{data.user.name}</h1>}
 *   </aside>
 * )
 * ```
 */

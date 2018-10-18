import React from 'react'
import propTypes from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

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
   * @returns {ReactElement} React virtual DOM element.
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
} = GraphQLContext

/**
 * A React component to manage a GraphQL query with a [`GraphQL`]{@link GraphQL} instance.
 * See also the [`Query`]{@link Query} component, which takes the [`GraphQL`]{@link GraphQL}
 * instance from context instead of a prop.
 * @kind class
 * @name GraphQLQuery
 * @param {Object} props Component props.
 * @param {GraphQL} props.graphql [`GraphQL`]{@link GraphQL} instance.
 * @param {GraphQLOperation} props.operation GraphQL operation.
 * @param {FetchOptionsOverride} [props.fetchOptionsOverride] Overrides default fetch options for the GraphQL request.
 * @param {boolean} [props.loadOnMount=false] Should the query load when the component mounts.
 * @param {boolean} [props.loadOnReset=false] Should the query load when its [GraphQL cache]{@link GraphQL#cache} entry is reset.
 * @param {boolean} [props.resetOnLoad=false] Should all other [GraphQL cache]{@link GraphQL#cache} reset when the query loads.
 * @param {QueryRender} props.children Renders the query status.
 * @ignore
 */
class GraphQLQuery extends React.Component {
  static propTypes = {
    graphql: propTypes.instanceOf(GraphQL).isRequired,
    fetchOptionsOverride: propTypes.func,
    operation: propTypes.object.isRequired,
    loadOnMount: propTypes.bool,
    loadOnReset: propTypes.bool,
    resetOnLoad: propTypes.bool,
    children: propTypes.func.isRequired
  }

  // eslint-disable-next-line require-jsdoc
  constructor(props) {
    super(props)

    this.state = { loading: props.loadOnMount }

    if (props.loadOnMount) {
      // Populate the request cache state to render data for SSR and while
      // the load called in componentDidMount on the client fetches fresh data.

      const fetchOptions = props.graphql.constructor.fetchOptions(
        props.operation
      )

      if (props.fetchOptionsOverride) props.fetchOptionsOverride(fetchOptions)

      this.state.fetchOptionsHash = props.graphql.constructor.hashFetchOptions(
        fetchOptions
      )

      this.state.requestCache = props.graphql.cache[this.state.fetchOptionsHash]
    }

    // Setup listeners.
    this.props.graphql.on('fetch', this.onFetch)
    this.props.graphql.on('cache', this.onCache)
    this.props.graphql.on('reset', this.onReset)
  }

  /**
   * Handles [GraphQL]{@link GraphQL} fetch
   * @kind function
   * @name GraphQLQuery#onFetch
   * @param {Object} details Event details.
   * @param {string} [details.fetchOptionsHash] The [fetch options]{@link FetchOptions} hash.
   * @ignore
   */
  onFetch = ({ fetchOptionsHash }) => {
    if (fetchOptionsHash === this.state.fetchOptionsHash)
      this.setState({ loading: true })
  }

  /**
   * Handles [GraphQL]{@link GraphQL} cache
   * @kind function
   * @name GraphQLQuery#onCache
   * @param {Object} details Event details.
   * @param {string} [details.fetchOptionsHash] The cache [fetch options]{@link FetchOptions} hash.
   * @ignore
   */
  onCache = ({ fetchOptionsHash }) => {
    if (fetchOptionsHash === this.state.fetchOptionsHash)
      this.setState({
        loading: false,
        requestCache: this.props.graphql.cache[fetchOptionsHash]
      })
  }

  /**
   * Handles [GraphQL]{@link GraphQL} reset
   * @kind function
   * @name GraphQLQuery#onReset
   * @param {Object} details Event details.
   * @param {string} [details.exceptFetchOptionsHash] A [fetch options]{@link FetchOptions} hash for cache exempt from deletion.
   * @ignore
   */
  onReset = ({ exceptFetchOptionsHash }) => {
    if (exceptFetchOptionsHash !== this.state.fetchOptionsHash)
      if (this.props.loadOnReset) this.load()
      else this.setState({ requestCache: null })
  }

  /**
   * Loads the query, updating cache.
   * @kind function
   * @name GraphQLQuery#load
   * @returns {Promise<RequestCache>} A promise that resolves the [request cache]{@link RequestCache}.
   * @ignore
   */
  load = () => {
    const { fetchOptionsHash, cache, request } = this.props.graphql.query({
      operation: this.props.operation,
      fetchOptionsOverride: this.props.fetchOptionsOverride,
      resetOnLoad: this.props.resetOnLoad
    })

    this.setState({ loading: true, fetchOptionsHash, cache })

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
   * @param {Object} props New props.
   * @param {GraphQLOperation} props.operation GraphQL operation.
   * @ignore
   */
  componentDidUpdate({ operation }) {
    if (!equal(operation, this.props.operation))
      if (this.props.loadOnMount) this.load()
      else
        this.setState({
          fetchOptionsHash: null,
          requestCache: null
        })
  }

  /**
   * Invoked before the React component is unmounted and destroyed.
   * @kind function
   * @name GraphQLQuery#componentWillUnmount
   * @ignore
   */
  componentWillUnmount() {
    this.props.graphql.off('fetch', this.onFetch)
    this.props.graphql.off('cache', this.onCache)
    this.props.graphql.off('reset', this.onReset)
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
 * @param {GraphQLOperation} props.operation GraphQL operation.
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
    {graphql => <GraphQLQuery graphql={graphql} {...props} />}
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
 * @example <caption>Rendering a user profile query.</caption>
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

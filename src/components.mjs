import React from 'react'
import propTypes from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

export const {
  Provider: GraphQLProvider,
  Consumer: GraphQLConsumer
} = React.createContext()

export class Query extends React.Component {
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

  constructor(props) {
    super(props)
    this.validateProps()
    this.state = { loading: props.loadOnMount }
  }

  validateProps = () => {
    if (this.props.loadOnReset && this.props.resetOnLoad)
      throw new Error('Conflicting “loadOnReset” and “resetOnLoad” props.')
  }

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

export class Mutation extends Query {
  static defaultProps = {
    loadOnMount: false,
    loadOnReset: false,
    resetOnLoad: true
  }
}

export const GraphQLQuery = props => (
  <GraphQLConsumer>
    {graphql => <Query graphql={graphql} {...props} />}
  </GraphQLConsumer>
)

export const GraphQLMutation = props => (
  <GraphQLConsumer>
    {graphql => <Mutation graphql={graphql} {...props} />}
  </GraphQLConsumer>
)

import React, { Component, createContext } from 'react'
import { string, bool, object, func, instanceOf } from 'prop-types'
import equal from 'fast-deep-equal'
import { GraphQL } from './graphql'

export const {
  Provider: GraphQLProvider,
  Consumer: GraphQLConsumer
} = createContext()

export class Query extends Component {
  static propTypes = {
    graphql: instanceOf(GraphQL).isRequired,
    variables: object,
    query: string.isRequired,
    loadOnMount: bool,
    loadOnReset: bool,
    resetOnLoad: bool,
    children: func.isRequired
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

    // Start listening for cache updates.
    props.graphql.on('cacheupdate', this.handleCacheUpdate)
  }

  validateProps = () => {
    if (this.props.loadOnReset && this.props.resetOnLoad)
      throw new Error('Conflicting “loadOnReset” and “resetOnLoad” props.')
  }

  handleCacheUpdate = ({ requestHash, cache }) => {
    if (
      // Cache updated for this component’s request.
      requestHash === this.state.requestHash
    ) {
      if (requestHash == 'tia6n9') console.log(requestHash, cache)
      if (
        // Cache has been reset and
        !cache &&
        // the component is to load on reset cache…
        this.props.loadOnReset
      )
        // Load and get fresh cache.
        this.load()
      else
        // Upldate the cache.
        this.setState({ cache })
    }
  }

  load = () => {
    const { oldRequestCache, requestHash, request } = this.props.graphql.query({
      variables: this.props.variables,
      query: this.props.query
    })

    const stateUpdate = {
      // Store request hash for listening to cache updates.
      requestHash,
      loading: true
    }

    if (oldRequestCache)
      // If present, use existing cache during load. It might not already be in
      // the local state if the same request was cached via another component.
      stateUpdate.cache = oldRequestCache

    this.setState(stateUpdate, () =>
      request.then(() => {
        // Request done. Elsewhere a global cache listener updates the local
        // state cache.
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
    // Revalidate potentially conflicting props.
    this.validateProps()

    if (
      // Load on cache reset enabled and
      this.props.loadOnReset &&
      // a load has happened before and
      this.state.requestHash &&
      // props that may affect the cache have changed…
      (query !== this.props.query || !equal(variables, this.props.variables))
    )
      // Reload.
      this.load()
  }

  componentWillUnmount() {
    this.props.graphql.off('cacheupdate', this.handleCache)
  }

  render() {
    return this.props.children({
      load: this.load,
      loading: this.state.loading,
      ...this.state.cache
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

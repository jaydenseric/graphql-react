import React, { Component, createContext } from 'react'
import { string, bool, object, func, instanceOf } from 'prop-types'
import { GraphQLClient } from './client'

export const {
  Provider: GraphQLClientProvider,
  Consumer: GraphQLClientConsumer
} = createContext()

export class Query extends Component {
  static propTypes = {
    client: instanceOf(GraphQLClient).isRequired,
    variables: object,
    query: string.isRequired,
    autoload: bool,
    children: func.isRequired
  }

  static defaultProps = {
    autoload: true
  }

  constructor(props) {
    super(props)

    this.state = {
      loading: this.props.autoload
    }

    props.client.on('reset', this.load)
  }

  load = () => {
    const { cache, request } = this.props.client.query({
      variables: this.props.variables,
      query: this.props.query
    })
    this.setState({ loading: true, cache })
    request.then(cache => this.setState({ loading: false, cache }))
  }

  componentDidMount() {
    if (this.props.autoload) this.load()
  }

  componentDidUpdate({ query, variables }) {
    // Update cache, if it exists.
    if (
      this.state.cache &&
      (variables !== this.props.variables || query !== this.props.query)
    )
      this.load()
  }

  componentWillUnmount() {
    this.props.client.off('reset', this.load)
  }

  render() {
    return this.props.children({
      load: this.load,
      loading: this.state.loading,
      ...this.state.cache
    })
  }
}

export const GraphQL = props => (
  <GraphQLClientConsumer>
    {client => <Query client={client} {...props} />}
  </GraphQLClientConsumer>
)

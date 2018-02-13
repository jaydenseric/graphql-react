import React, { Component, createContext } from 'react'
import { string, object, func, instanceOf, node } from 'prop-types'
import { Client } from './client'

const { Provider, Consumer } = createContext()

export const GraphQLProvider = ({ client, children }) => (
  <Provider value={client}>{children}</Provider>
)

GraphQLProvider.propTypes = {
  client: instanceOf(Client).isRequired,
  children: node.isRequired
}

export class Query extends Component {
  static propTypes = {
    client: instanceOf(Client).isRequired,
    variables: object,
    query: string.isRequired,
    children: func.isRequired
  }

  state = {
    loading: true
  }

  load = () => {
    const { cache, request } = this.props.client.query({
      variables: this.props.variables,
      query: this.props.query
    })
    this.setState({ loading: true, ...cache })
    request.then(result => this.setState({ loading: false, ...result }))
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate({ query, variables }) {
    if (variables !== this.props.variables || query !== this.props.query)
      this.load()
  }

  render() {
    return this.props.children({ reload: this.load, ...this.state })
  }
}

export const GraphQL = props => (
  <Consumer>{client => <Query client={client} {...props} />}</Consumer>
)

import { Component } from 'react'
import { string, object, func, instanceOf } from 'prop-types'
import { Client } from './client'

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

import 'isomorphic-unfetch'
import { GraphQL, Provider, preload } from 'graphql-react'
import Head from 'next/head'

let graphql

export default children => {
  const GraphQLProvider = ({ cache }) => {
    graphql = (process.browser && graphql) || new GraphQL({ cache })
    return <Provider value={graphql}>{children}</Provider>
  }

  if (!process.browser)
    GraphQLProvider.getInitialProps = async () => {
      const graphql = new GraphQL()
      await preload(<Provider value={graphql}>{children}</Provider>)
      Head.rewind()
      return { cache: graphql.cache }
    }

  return GraphQLProvider
}

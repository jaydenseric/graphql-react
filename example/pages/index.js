import { GraphQL, GraphQLProvider } from 'graphql-react'
import CacheResetter from '../components/cache-resetter'
import CreateTimer from '../components/create-timer'
import Timers from '../components/timers'

const graphql = new GraphQL({
  requestOptions: options => {
    options.url = 'http://localhost:3000/graphql'
  }
})

const HomePage = () => (
  <GraphQLProvider value={graphql}>
    <h1>Example Next.js app &amp; GraphQL API</h1>
    <Timers />
    <CreateTimer />
    <CacheResetter />
  </GraphQLProvider>
)

export default HomePage

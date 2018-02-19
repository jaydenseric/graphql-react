import { GraphQLClient, GraphQLClientProvider } from '../../lib'
import CacheResetter from '../components/cache-resetter'
import CreateTimer from '../components/create-timer'
import Timers from '../components/timers'

const client = new GraphQLClient({
  requestOptions: options => {
    options.url = 'http://localhost:3000/graphql'
  }
})

const HomePage = () => (
  <GraphQLClientProvider value={client}>
    <h1>Example Next.js app &amp; GraphQL API</h1>
    <Timers />
    <CreateTimer />
    <CacheResetter />
  </GraphQLClientProvider>
)

export default HomePage

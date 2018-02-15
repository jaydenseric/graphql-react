import { GraphQLClient, GraphQLClientProvider } from '../../lib'
import CacheResetter from '../components/cache-resetter'
import PokemonViewer from '../components/pokemon-viewer'

const client = new GraphQLClient({
  requestOptions: options => {
    options.url = 'https://graphql-pokemon.now.sh/graphql'
  }
})

const HomePage = () => (
  <GraphQLClientProvider value={client}>
    <h1>Pokemon viewer</h1>
    <CacheResetter />
    <PokemonViewer />
  </GraphQLClientProvider>
)

export default HomePage

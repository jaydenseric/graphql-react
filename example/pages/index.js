import { GraphQLProvider, Client } from '../../lib'
import PokemonViewer from '../components/pokemon-viewer'

const client = new Client({
  requestOptions: options => {
    options.url = 'https://graphql-pokemon.now.sh/graphql'
  }
})

const HomePage = () => (
  <GraphQLProvider client={client}>
    <h1>Pokemon viewer</h1>
    <PokemonViewer />
  </GraphQLProvider>
)

export default HomePage

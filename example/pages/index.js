import { Fragment } from 'react'
import { Client } from '../../lib'
import PokemonViewer from '../components/pokemon-viewer'

const client = new Client({
  requestOptions: options => {
    options.url = 'https://graphql-pokemon.now.sh/graphql'
  }
})

const HomePage = () => (
  <Fragment>
    <h1>Pokemon viewer</h1>
    <PokemonViewer client={client} />
  </Fragment>
)

export default HomePage

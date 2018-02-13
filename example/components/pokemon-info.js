import { Fragment } from 'react'
import { string, instanceOf } from 'prop-types'
import { Client, Query } from '../../lib'
import Loader from './loader'

const PokemonInfo = ({ client, pokemonId }) => (
  <Query
    client={client}
    variables={{ pokemonId }}
    query={`
      query($pokemonId: String!){
        pokemon(id: $pokemonId) {
          id
          number
          name
        }
      }
    `}
  >
    {({ loading, data, reload }) => (
      <article>
        {data && (
          <Fragment>
            <h1>
              #{data.pokemon.number}: {data.pokemon.name}
            </h1>
          </Fragment>
        )}
        {loading ? <Loader /> : <button onClick={reload}>Reload</button>}
      </article>
    )}
  </Query>
)

PokemonInfo.propTypes = {
  client: instanceOf(Client).isRequired,
  pokemonId: string.isRequired
}

export default PokemonInfo

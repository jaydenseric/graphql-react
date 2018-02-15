import { Fragment } from 'react'
import { string } from 'prop-types'
import { GraphQL } from '../../lib'
import Loader from './loader'

const PokemonInfo = ({ pokemonId }) => (
  <GraphQL
    autoload={false}
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
    {({ loading, data, load }) => (
      <article>
        {data && (
          <Fragment>
            <h1>
              #{data.pokemon.number}: {data.pokemon.name}
            </h1>
          </Fragment>
        )}
        {loading ? <Loader /> : <button onClick={load}>Load</button>}
      </article>
    )}
  </GraphQL>
)

PokemonInfo.propTypes = {
  pokemonId: string.isRequired
}

export default PokemonInfo

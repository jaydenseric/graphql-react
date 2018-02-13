import { Component } from 'react'
import { func } from 'prop-types'
import { GraphQL } from '../../lib'
import Loader from './loader'

export default class PokemonPicker extends Component {
  static propTypes = {
    onPokemonPicked: func.isRequired
  }

  state = {}

  handleChange = ({ target: { value } }) =>
    this.setState({ pokemonId: value }, () =>
      this.props.onPokemonPicked(this.state.pokemonId)
    )

  render() {
    return (
      <GraphQL
        query={`
          {
            pokemons(first: 151) {
              id
              name
            }
          }
        `}
      >
        {({ loading, data }) =>
          loading ? (
            <Loader />
          ) : (
            <select
              defaultValue=""
              value={this.state.pokemonId}
              onChange={this.handleChange}
            >
              <option value="" disabled>
                Choose a Pokemon
              </option>
              {data.pokemons.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )
        }
      </GraphQL>
    )
  }
}

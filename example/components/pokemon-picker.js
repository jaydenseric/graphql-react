import { Component } from 'react'
import { func } from 'prop-types'
import { GraphQL } from '../../lib'
import Loader from './loader'

export default class PokemonPicker extends Component {
  static propTypes = {
    onPokemonPicked: func.isRequired
  }

  state = {
    pokemonId: ''
  }

  handleChange = ({ target: { value } }) =>
    this.setState({ pokemonId: value }, () => {
      if (value !== '') this.props.onPokemonPicked(this.state.pokemonId)
    })

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
            <select value={this.state.pokemonId} onChange={this.handleChange}>
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

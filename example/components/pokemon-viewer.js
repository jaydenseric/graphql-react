import { Component } from 'react'
import PokemonPicker from './pokemon-picker'
import PokemonInfo from './pokemon-info'

export default class PokemonViewer extends Component {
  state = {}

  handlePokemonPicked = pokemonId => this.setState({ pokemonId })

  render() {
    return (
      <div>
        <PokemonPicker onPokemonPicked={this.handlePokemonPicked} />
        {this.state.pokemonId && (
          <PokemonInfo pokemonId={this.state.pokemonId} />
        )}
      </div>
    )
  }
}

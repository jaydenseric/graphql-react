import { Component, Fragment } from 'react'
import { instanceOf } from 'prop-types'
import { Client } from '../../lib'
import PokemonPicker from './pokemon-picker'
import PokemonInfo from './pokemon-info'

export default class PokemonViewer extends Component {
  static propTypes = {
    client: instanceOf(Client).isRequired
  }

  state = {}

  handlePokemonPicked = pokemonId => this.setState({ pokemonId })

  render() {
    return (
      <Fragment>
        <PokemonPicker
          client={this.props.client}
          onPokemonPicked={this.handlePokemonPicked}
        />
        {this.state.pokemonId && (
          <PokemonInfo
            client={this.props.client}
            pokemonId={this.state.pokemonId}
          />
        )}
      </Fragment>
    )
  }
}

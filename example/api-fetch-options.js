export const timeFetchOptionsOverride = options => {
  options.url = 'http://localhost:3000/graphql'
}

export const pokemonFetchOptionsOverride = options => {
  options.url = 'https://graphql-pokemon.now.sh'
}

export const timeFetchOptionsOverride = options => {
  options.url = process.env.API_URL
}

export const pokemonFetchOptionsOverride = options => {
  options.url = 'https://graphql-pokemon.now.sh'
}

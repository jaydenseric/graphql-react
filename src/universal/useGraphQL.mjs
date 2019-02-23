import React from 'react'
import { GraphQL } from './GraphQL'
import { GraphQLContext } from './GraphQLContext'
import { graphqlFetchOptions } from './graphqlFetchOptions'
import { hashObject } from './hashObject'

/**
 * A [React hook](https://reactjs.org/docs/hooks-intro) to manage a GraphQL
 * operation in a component.
 * @kind function
 * @name useGraphQL
 * @param {Object} options Options.
 * @param {GraphQLFetchOptionsOverride} [options.fetchOptionsOverride] Overrides default [`fetch` options]{@link GraphQLFetchOptions} for the GraphQL operation.
 * @param {boolean} [options.loadOnMount=true] Should the operation load when the component mounts.
 * @param {boolean} [options.loadOnReset=true] Should the operation load when its [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue} is reset.
 * @param {boolean} [options.resetOnLoad=false] Should all other [GraphQL cache]{@link GraphQL#cache} reset when the operation loads.
 * @param {GraphQLOperation} options.operation GraphQL operation.
 * @returns {GraphQLOperationStatus} GraphQL operation status.
 * @see [`GraphQLContext`]{@link GraphQLContext} `Provider`; required for [`useGraphQL`]{@link useGraphQL} to work.
 * @example <caption>A component that displays a Pokémon image.</caption>
 * ```jsx
 * import { useGraphQL } from 'graphql-react'
 *
 * const PokemonImage = ({ name }) => {
 *  const { loading, cacheValue = {} } = useGraphQL({
 *    fetchOptionsOverride(options) {
 *      options.url = 'https://graphql-pokemon.now.sh'
 *    },
 *    operation: {
 *      query: `{ pokemon(name: "${name}") { image } }`
 *    }
 *  })
 *
 *  return cacheValue.data ? (
 *    <img src={cacheValue.data.pokemon.image} alt={name} />
 *  ) : loading ? (
 *    'Loading…'
 *  ) : (
 *    'Error!'
 *  )
 *}
 * ```
 */
export const useGraphQL = ({
  fetchOptionsOverride,
  loadOnMount = true,
  loadOnReset = true,
  resetOnLoad = false,
  operation
}) => {
  const graphql = React.useContext(GraphQLContext)
  if (typeof graphql === 'undefined')
    throw new Error('GraphQL context missing.')
  if (!(graphql instanceof GraphQL))
    throw new Error('GraphQL context must be a GraphQL instance.')

  const fetchOptions = graphqlFetchOptions(operation)
  if (fetchOptionsOverride) fetchOptionsOverride(fetchOptions)

  const fetchOptionsHash = hashObject(fetchOptions)

  let [cacheKey, setCacheKey] = React.useState(fetchOptionsHash)
  let [cacheValue, setCacheValue] = React.useState(graphql.cache[cacheKey])
  let [loading, setLoading] = React.useState(
    cacheKey in graphql.operations || loadOnMount
  )

  // If the GraphQL operation or its fetch options change after the initial
  // render the state has to be re-initialized.
  if (cacheKey !== fetchOptionsHash) {
    setCacheKey((cacheKey = fetchOptionsHash))
    setCacheValue((cacheValue = graphql.cache[cacheKey]))
    setLoading((loading = cacheKey in graphql.operations || loadOnMount))
  }

  /**
   * Loads the GraphQL query.
   * @returns {GraphQLOperationLoading} Loading operation details.
   * @ignore
   */
  const operate = () =>
    throw graphql.operate({
      operation,
      fetchOptionsOverride,
      resetOnLoad
    })

  /**
   * Loads the GraphQL query, updating state.
   * @returns {Promise<GraphQLCacheValue>} Resolves the loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
   * @ignore
   */
  const load = () => {
    const { cacheKey, cacheValue, cacheValuePromise } = operate()

    setLoading(true)
    setCacheKey(cacheKey)
    setCacheValue(cacheValue)

    throw cacheValuePromise
  }

  /**
   * Handles a [`GraphQL`]{@link GraphQL} `fetch` event.
   * @ignore
   */
  const onFetch = ({ cacheKey: fetchingCacheKey }) => {
    if (cacheKey === fetchingCacheKey) setLoading(true)
  }

  /**
   * Handles a [`GraphQL`]{@link GraphQL} `cache` event.
   * @ignore
   */
  const onCache = ({ cacheKey: cachedCacheKey, cacheValue }) => {
    if (cacheKey === cachedCacheKey) {
      setLoading(false)
      setCacheValue(cacheValue)
    }
  }

  /**
   * Handles a [`GraphQL`]{@link GraphQL} `reset` event.
   * @ignore
   */
  const onReset = ({ exceptCacheKey }) => {
    if (cacheKey !== exceptCacheKey)
      if (loadOnReset) load()
      else setCacheValue(graphql.cache[cacheKey])
  }

  React.useEffect(() => {
    graphql.on('fetch', onFetch)
    graphql.on('cache', onCache)
    graphql.on('reset', onReset)

    if (loadOnMount) load()

    return () => {
      graphql.off('fetch', onFetch)
      graphql.off('cache', onCache)
      graphql.off('reset', onReset)
    }
  }, [
    // Setup on component mount and cleanup on component unmount, but also if
    // the cacheKey changes so that the callbacks run in the right closure.
    cacheKey
  ])

  if (graphql.ssr && loadOnMount && !cacheValue) operate()

  return { load, loading, cacheKey, cacheValue }
}

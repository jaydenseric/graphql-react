'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const GraphQL = require('./GraphQL');
const GraphQLContext = require('./GraphQLContext');
const FirstRenderDateContext = require('./private/FirstRenderDateContext');
const graphqlFetchOptions = require('./private/graphqlFetchOptions');
const hashObject = require('./private/hashObject');

/**
 * A [React hook](https://reactjs.org/docs/hooks-intro) to manage a GraphQL
 * operation in a component.
 * @kind function
 * @name useGraphQL
 * @param {object} options Options.
 * @param {GraphQLFetchOptionsOverride} [options.fetchOptionsOverride] Overrides default [`fetch` options]{@link GraphQLFetchOptions} for the GraphQL operation.
 * @param {boolean} [options.loadOnMount=false] Should the operation load when the component mounts.
 * @param {boolean} [options.loadOnReload=false] Should the operation load when the [`GraphQL`]{@link GraphQL} `reload` event fires and there is a [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue} to reload, but only if the operation was not the one that caused the reload.
 * @param {boolean} [options.loadOnReset=false] Should the operation load when the [`GraphQL`]{@link GraphQL} `reset` event fires and the [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue} is deleted, but only if the operation was not the one that caused the reset.
 * @param {boolean} [options.reloadOnLoad=false] Should a [GraphQL reload]{@link GraphQL#reload} happen after the operation loads, excluding the loaded operation cache.
 * @param {boolean} [options.resetOnLoad=false] Should a [GraphQL reset]{@link GraphQL#reset} happen after the operation loads, excluding the loaded operation cache.
 * @param {GraphQLOperation} options.operation GraphQL operation.
 * @returns {GraphQLOperationStatus} GraphQL operation status.
 * @see [`GraphQLContext`]{@link GraphQLContext} is required for this hook to work.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useGraphQL } from 'graphql-react';
 * ```
 *
 * ```js
 * import useGraphQL from 'graphql-react/universal/useGraphQL.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useGraphQL } = require('graphql-react');
 * ```
 *
 * ```js
 * const useGraphQL = require('graphql-react/universal/useGraphQL');
 * ```
 * @example <caption>A component that displays a Pokémon image.</caption>
 * ```jsx
 * import { useGraphQL } from 'graphql-react';
 * import React from 'react';
 *
 * const PokemonImage = ({ name }) => {
 *   const { loading, cacheValue = {} } = useGraphQL({
 *     fetchOptionsOverride(options) {
 *       options.url = 'https://graphql-pokemon.now.sh';
 *     },
 *     operation: {
 *       query: `{ pokemon(name: "${name}") { image } }`,
 *     },
 *     loadOnMount: true,
 *     loadOnReload: true,
 *     loadOnReset: true,
 *   });
 *
 *   return cacheValue.data ? (
 *     <img src={cacheValue.data.pokemon.image} alt={name} />
 *   ) : loading ? (
 *     'Loading…'
 *   ) : (
 *     'Error!'
 *   );
 * };
 * ```
 * @example <caption>Options guide for common situations.</caption>
 * | Situation | `loadOnMount` | `loadOnReload` | `loadOnReset` | `reloadOnLoad` | `resetOnLoad` |
 * | :-- | :-: | :-: | :-: | :-: | :-: |
 * | Profile query | ✔️ | ✔️ | ✔️ |  |  |
 * | Login mutation |  |  |  |  | ✔️ |
 * | Logout mutation |  |  |  |  | ✔️ |
 * | Change password mutation |  |  |  |  |  |
 * | Change name mutation |  |  |  | ✔️ |  |
 * | Like a post mutation |  |  |  | ✔️ |  |
 */
module.exports = function useGraphQL({
  fetchOptionsOverride,
  loadOnMount,
  loadOnReload,
  loadOnReset,
  reloadOnLoad,
  resetOnLoad,
  operation,
}) {
  if (reloadOnLoad && resetOnLoad)
    throw new Error(
      'useGraphQL() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'
    );

  const graphql = React.useContext(GraphQLContext);

  if (typeof graphql === 'undefined')
    throw new Error('GraphQL context missing.');

  if (!(graphql instanceof GraphQL))
    throw new Error('GraphQL context must be a GraphQL instance.');

  const fetchOptions = graphqlFetchOptions(operation);
  if (fetchOptionsOverride) fetchOptionsOverride(fetchOptions);

  const fetchOptionsHash = hashObject(fetchOptions);

  let [cacheKey, setCacheKey] = React.useState(fetchOptionsHash);
  let [cacheValue, setCacheValue] = React.useState(graphql.cache[cacheKey]);
  let [loading, setLoading] = React.useState(cacheKey in graphql.operations);

  // If the GraphQL operation or its fetch options change after the initial
  // render the state has to be re-initialized.
  if (cacheKey !== fetchOptionsHash) {
    setCacheKey((cacheKey = fetchOptionsHash));
    setCacheValue((cacheValue = graphql.cache[cacheKey]));
    setLoading((loading = cacheKey in graphql.operations));
  }

  /**
   * Loads the GraphQL query, updating state.
   * @returns {Promise<GraphQLCacheValue>} Resolves the loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
   * @ignore
   */
  const load = React.useCallback(() => {
    const { cacheKey, cacheValue, cacheValuePromise } = graphql.operate({
      operation,
      fetchOptionsOverride,
      reloadOnLoad,
      resetOnLoad,
    });

    setLoading(true);
    setCacheKey(cacheKey);
    setCacheValue(cacheValue);

    return cacheValuePromise;
  }, [fetchOptionsOverride, graphql, operation, reloadOnLoad, resetOnLoad]);

  const isMountedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;

    /**
     * Handles the [`GraphQL` event `fetch`]{@link GraphQL#event:fetch}.
     * @param {GraphQL#event:fetch} event Event data.
     * @ignore
     */
    function onFetch({ cacheKey: fetchingCacheKey }) {
      if (cacheKey === fetchingCacheKey && isMountedRef.current)
        setLoading(true);
    }

    /**
     * Handles the [`GraphQL` event `cache`]{@link GraphQL#event:cache}.
     * @param {GraphQL#event:cache} event Event data.
     * @ignore
     */
    function onCache({ cacheKey: cachedCacheKey, cacheValue }) {
      if (cacheKey === cachedCacheKey && isMountedRef.current)
        ReactDOM.unstable_batchedUpdates(() => {
          setLoading(false);
          setCacheValue(cacheValue);
        });
    }

    /**
     * Handles the [`GraphQL` event `reload`]{@link GraphQL#event:reload}.
     * @param {GraphQL#event:reload} event Event data.
     * @ignore
     */
    function onReload({ exceptCacheKey }) {
      if (
        cacheKey !== exceptCacheKey &&
        loadOnReload &&
        cacheValue &&
        isMountedRef.current
      )
        load();
    }

    /**
     * Handles the [`GraphQL` event `reset`]{@link GraphQL#event:reset}.
     * @param {GraphQL#event:reset} event Event data.
     * @ignore
     */
    function onReset({ exceptCacheKey }) {
      if (cacheKey !== exceptCacheKey && isMountedRef.current)
        if (loadOnReset) load();
        else setCacheValue(graphql.cache[cacheKey]);
    }

    graphql.on('fetch', onFetch);
    graphql.on('cache', onCache);
    graphql.on('reload', onReload);
    graphql.on('reset', onReset);

    return () => {
      isMountedRef.current = false;

      graphql.off('fetch', onFetch);
      graphql.off('cache', onCache);
      graphql.off('reload', onReload);
      graphql.off('reset', onReset);
    };
  }, [cacheKey, cacheValue, graphql, load, loadOnReload, loadOnReset]);

  const [loadedOnMountCacheKey, setLoadedOnMountCacheKey] = React.useState();

  // Note: Allowed to be undefined for apps that don’t provide this context.
  const firstRenderDate = React.useContext(FirstRenderDateContext);

  React.useEffect(() => {
    if (
      loadOnMount &&
      // The load on mount hasn’t been triggered yet.
      cacheKey !== loadedOnMountCacheKey &&
      !(
        cacheValue &&
        // Within a short enough time since the GraphQL provider first rendered
        // to be considered post SSR hydration.
        new Date() - firstRenderDate < 1000
      )
    ) {
      setLoadedOnMountCacheKey(cacheKey);
      load();
    }
  }, [
    cacheKey,
    cacheValue,
    firstRenderDate,
    load,
    loadOnMount,
    loadedOnMountCacheKey,
  ]);

  if (graphql.ssr && loadOnMount && !cacheValue)
    graphql.operate({
      operation,
      fetchOptionsOverride,
      reloadOnLoad,
      resetOnLoad,
    });

  return { load, loading, cacheKey, cacheValue };
};

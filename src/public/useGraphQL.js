'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const WaterfallRenderContext = require('react-waterfall-render/public/WaterfallRenderContext');
const FirstRenderDateContext = require('../private/FirstRenderDateContext');
const graphqlFetchOptions = require('../private/graphqlFetchOptions');
const GraphQL = require('./GraphQL');
const GraphQLContext = require('./GraphQLContext');
const hashObject = require('./hashObject');

/**
 * A [React hook](https://reactjs.org/docs/hooks-intro) to manage a GraphQL
 * operation in a component.
 * @kind function
 * @name useGraphQL
 * @param {object} options Options.
 * @param {GraphQLOperation} options.operation GraphQL operation. To reduce work for following renders, define it outside the component or memoize it using the [`React.useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) hook.
 * @param {GraphQLFetchOptionsOverride} [options.fetchOptionsOverride] Overrides default [`fetch` options]{@link GraphQLFetchOptions} for the [GraphQL operation]{@link GraphQLOperation}. To reduce work for following renders, define it outside the component or memoize it using the [`React.useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) hook.
 * @param {GraphQLCacheKeyCreator} [options.cacheKeyCreator=hashObject] [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey} creator for the operation.
 * @param {boolean} [options.loadOnMount=false] Should the operation load when the component mounts.
 * @param {boolean} [options.loadOnReload=false] Should the operation load when the [`GraphQL`]{@link GraphQL} [`reload`]{@link GraphQL#event:reload} event fires and there is a [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue} to reload, but only if the operation was not the one that caused the reload.
 * @param {boolean} [options.loadOnReset=false] Should the operation load when the [`GraphQL`]{@link GraphQL} [`reset`]{@link GraphQL#event:reset} event fires and the [GraphQL cache]{@link GraphQL#cache} [value]{@link GraphQLCacheValue} is deleted, but only if the operation was not the one that caused the reset.
 * @param {boolean} [options.reloadOnLoad=false] Should a [GraphQL reload]{@link GraphQL#reload} happen after the operation loads, excluding the loaded operation cache.
 * @param {boolean} [options.resetOnLoad=false] Should a [GraphQL reset]{@link GraphQL#reset} happen after the operation loads, excluding the loaded operation cache.
 * @returns {GraphQLOperationStatus} GraphQL operation status.
 * @see [`GraphQLContext`]{@link GraphQLContext} is required for this hook to work.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { useGraphQL } from 'graphql-react';
 * ```
 *
 * ```js
 * import useGraphQL from 'graphql-react/public/useGraphQL.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { useGraphQL } = require('graphql-react');
 * ```
 *
 * ```js
 * const useGraphQL = require('graphql-react/public/useGraphQL');
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
  operation,
  fetchOptionsOverride,
  cacheKeyCreator = hashObject,
  loadOnMount,
  loadOnReload,
  loadOnReset,
  reloadOnLoad,
  resetOnLoad,
}) {
  if (typeof cacheKeyCreator !== 'function')
    throw new TypeError(
      'useGraphQL() option “cacheKeyCreator” must be a function.'
    );

  if (reloadOnLoad && resetOnLoad)
    throw new TypeError(
      'useGraphQL() options “reloadOnLoad” and “resetOnLoad” can’t both be true.'
    );

  const graphql = React.useContext(GraphQLContext);

  if (typeof graphql === 'undefined')
    throw new TypeError('GraphQL context missing.');

  if (!(graphql instanceof GraphQL))
    throw new TypeError('GraphQL context must be a GraphQL instance.');

  const freshCacheKey = React.useMemo(() => {
    const fetchOptions = graphqlFetchOptions(operation);

    if (fetchOptionsOverride) fetchOptionsOverride(fetchOptions);

    return cacheKeyCreator(fetchOptions);
  }, [cacheKeyCreator, fetchOptionsOverride, operation]);

  let [loading, setLoading] = React.useState(
    freshCacheKey in graphql.operations
  );
  let [cacheKey, setCacheKey] = React.useState(freshCacheKey);
  let [cacheValue, setCacheValue] = React.useState(
    graphql.cache[freshCacheKey]
  );
  let [loadedCacheValue, setLoadedCacheValue] = React.useState(cacheValue);

  // If the GraphQL operation or its fetch options change after the initial
  // render the state has to be re-initialized.
  if (cacheKey !== freshCacheKey) {
    setLoading((loading = freshCacheKey in graphql.operations));
    setCacheKey((cacheKey = freshCacheKey));
    setCacheValue((cacheValue = graphql.cache[freshCacheKey]));
    if (cacheValue) setLoadedCacheValue((loadedCacheValue = cacheValue));
  }

  /**
   * Loads the GraphQL query, updating state.
   * @returns {Promise<GraphQLCacheValue>} Resolves the loaded [GraphQL cache]{@link GraphQLCache} [value]{@link GraphQLCacheValue}.
   * @ignore
   */
  const load = React.useCallback(() => {
    const { cacheValuePromise } = graphql.operate({
      operation,
      fetchOptionsOverride,
      cacheKeyCreator,
      reloadOnLoad,
      resetOnLoad,
    });

    setLoading(true);

    return cacheValuePromise;
  }, [
    cacheKeyCreator,
    fetchOptionsOverride,
    graphql,
    operation,
    reloadOnLoad,
    resetOnLoad,
  ]);

  const isMountedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Handles the [`GraphQL`]{@link GraphQL} [`fetch`]{@link GraphQL#event:fetch}
   * event.
   * @param {GraphQL#event:fetch} event Event data.
   * @ignore
   */
  const onFetch = React.useCallback(
    ({ cacheKey: fetchingCacheKey }) => {
      if (cacheKey === fetchingCacheKey && isMountedRef.current)
        setLoading(true);
    },
    [cacheKey]
  );

  React.useEffect(() => {
    graphql.on('fetch', onFetch);

    return () => {
      graphql.off('fetch', onFetch);
    };
  }, [graphql, onFetch]);

  /**
   * Handles the [`GraphQL`]{@link GraphQL} [`cache`]{@link GraphQL#event:cache}
   * event.
   * @param {GraphQL#event:cache} event Event data.
   * @ignore
   */
  const onCache = React.useCallback(
    ({ cacheKey: cachedCacheKey, cacheValue }) => {
      if (cacheKey === cachedCacheKey && isMountedRef.current)
        ReactDOM.unstable_batchedUpdates(() => {
          setLoading(false);
          setCacheValue(cacheValue);
          setLoadedCacheValue(cacheValue);
        });
    },
    [cacheKey]
  );

  React.useEffect(() => {
    graphql.on('cache', onCache);

    return () => {
      graphql.off('cache', onCache);
    };
  }, [graphql, onCache]);

  /**
   * Handles the [`GraphQL`]{@link GraphQL} [`reload`]{@link GraphQL#event:reload}
   * event.
   * @param {GraphQL#event:reload} event Event data.
   * @ignore
   */
  const onReload = React.useCallback(
    ({ exceptCacheKey }) => {
      if (
        cacheKey !== exceptCacheKey &&
        loadOnReload &&
        cacheValue &&
        isMountedRef.current
      )
        load();
    },
    [cacheKey, cacheValue, load, loadOnReload]
  );

  React.useEffect(() => {
    graphql.on('reload', onReload);

    return () => {
      graphql.off('reload', onReload);
    };
  }, [graphql, onReload]);

  /**
   * Handles the [`GraphQL`]{@link GraphQL} [`reset`]{@link GraphQL#event:reset}
   * event.
   * @param {GraphQL#event:reset} event Event data.
   * @ignore
   */
  const onReset = React.useCallback(
    ({ exceptCacheKey }) => {
      if (cacheKey !== exceptCacheKey && isMountedRef.current) {
        ReactDOM.unstable_batchedUpdates(() => {
          setCacheValue(graphql.cache[cacheKey]);
          setLoadedCacheValue(graphql.cache[cacheKey]);
        });

        if (loadOnReset) load();
      }
    },
    [cacheKey, graphql.cache, load, loadOnReset]
  );

  React.useEffect(() => {
    graphql.on('reset', onReset);

    return () => {
      graphql.off('reset', onReset);
    };
  }, [graphql, onReset]);

  const [loadedOnMountCacheKey, setLoadedOnMountCacheKey] = React.useState();

  // Allowed to be undefined for apps that don’t provide this context.
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

  const declareLoading = React.useContext(WaterfallRenderContext);

  if (declareLoading && loadOnMount && !cacheValue) {
    const { cacheValuePromise } = graphql.operate({
      operation,
      fetchOptionsOverride,
      cacheKeyCreator,
      reloadOnLoad,
      resetOnLoad,
    });

    declareLoading(cacheValuePromise);
  }

  return React.useMemo(
    () => ({ load, loading, cacheKey, cacheValue, loadedCacheValue }),
    [cacheKey, cacheValue, loadedCacheValue, load, loading]
  );
};

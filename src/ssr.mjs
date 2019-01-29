import ReactDOMServer from 'react-dom/server'
import { GraphQL } from './GraphQL'

/**
 * Asynchronously server side renders a [React node]{@link ReactNode},
 * preloading all [`Query`]{@link Query} components that have the `loadOnMount`
 * prop. After resolving, cache can be exported from the
 * [`GraphQL` instance property `cache`]{@link GraphQL#cache} for serialization
 * (usually as JSON) and transport to the client for hydration via the
 * [`GraphQL` constructor parameter `options.cache`]{@link GraphQL}.
 * @kind function
 * @name ssr
 * @param {GraphQL} graphql [`GraphQL`]{@link GraphQL} instance.
 * @param {ReactNode} node React virtual DOM node.
 * @param {function} [render=ReactDOMServer.renderToStaticMarkup] Synchronous React server side render function, defaulting to [`ReactDOMServer.renderToStaticMarkup`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) as it is more efficient than [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring).
 * @returns {Promise<string>} Promise resolving the rendered HTML string.
 * @see [`ReactDOMServer` docs](https://reactjs.org/docs/react-dom-server).
 * @see [`next-graphql-react`](https://npm.im/next-graphql-react) makes it easy to use this API in a [Next.js](https://nextjs.org) project.
 * @example <caption>SSR function that resolves a HTML string and cache JSON for client hydration.</caption>
 * ```jsx
 * import { GraphQL, Provider } from 'graphql-react'
 * import { ssr } from 'graphql-react/lib/ssr'
 * import ReactDOMServer from 'react-dom/server'
 * import { App } from './components'
 *
 * async function render() {
 *   const graphql = new GraphQL()
 *   const page = (
 *     <Provider value={graphql}>
 *       <App />
 *     </Provider>
 *   )
 *   const html = await ssr(graphql, page, ReactDOMServer.renderToString)
 *   const cache = JSON.stringify(graphql.cache)
 *   return { html, cache }
 * }
 * ```
 * @example <caption>SSR function that resolves a HTML string suitable for a static page.</caption>
 * ```jsx
 * import { GraphQL, Provider } from 'graphql-react'
 * import { ssr } from 'graphql-react/lib/ssr'
 * import { App } from './components'
 *
 * function render() {
 *   const graphql = new GraphQL()
 *   const page = (
 *     <Provider value={graphql}>
 *       <App />
 *     </Provider>
 *   )
 *   return ssr(graphql, page)
 * }
 * ```
 */
export function ssr(
  graphql,
  node,
  render = ReactDOMServer.renderToStaticMarkup
) {
  return new Promise((resolve, reject) => {
    if (!(graphql instanceof GraphQL))
      throw new Error('ssr() argument 1 must be a GraphQL instance.')

    // Check argument 2 exists, allowing an undefined value as that is a valid
    // React node.
    if (arguments.length < 2)
      throw new Error('ssr() argument 2 must be a React node.')

    if (typeof render !== 'function')
      throw new Error('ssr() argument 3 must be a function.')

    // Signal for Query component render logic.
    graphql.ssr = true

    /**
     * Repeatedly renders the tree until all queries are cached.
     * @returns {Promise<string>} Promise resolving the final rendered HTML string.
     */
    function recurse() {
      const fetching = []

      /**
       * Handles GraphQL `fetch` events.
       * @kind function
       * @name ssr~onFetch
       * @param {Object} event The event payload.
       * @ignore
       */
      function onFetch({ cache }) {
        fetching.push(cache)
      }

      graphql.on('fetch', onFetch)

      const string = render(node)

      graphql.off('fetch', onFetch)

      if (fetching.length) return Promise.all(fetching).then(recurse)
      else {
        delete graphql.ssr
        return Promise.resolve(string)
      }
    }

    return recurse()
      .then(resolve)
      .catch(reject)
  })
}

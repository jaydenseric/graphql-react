/**
 * Recursively preloads {@link Query} components that have the `loadOnMount`
 * prop in a React element tree. Usefull for server side rendering (SSR) or to preload components for a better user experience when they mount.
 * @param {ReactElement} element A React virtual DOM element.
 * @returns {Promise} Resolves once loading is done and cache is ready to be exported from the {@link GraphQL} instance. Cache can be imported when constructing new {@link GraphQL} instances.
 * @example <caption>An async SSR function that returns a HTML string and cache JSON for client hydration.</caption>
 * import { GraphQL, preload, Provider } from 'graphql-react'
 * import { renderToString } from 'react-dom/server'
 * import { App } from './components'
 *
 * const graphql = new GraphQL()
 * const page = (
 *   <Provider value={graphql}>
 *     <App />
 *   </Provider>
 * )
 *
 * export async function ssr() {
 *   await preload(page)
 *   return {
 *     cache: JSON.stringify(graphql.cache),
 *     html: renderToString(page)
 *   }
 * }
 */
export function preload(element) {
  const recursePreload = (rootElement, loadRoot = true) => {
    const loading = []
    const recurse = element => {
      if (!element) return

      if (Array.isArray(element)) {
        element.forEach(item => recurse(item))
        return
      }

      if (
        // The element is not a childless string or number and…
        element.type &&
        // …It’s a context consumer or a functional/class component…
        (element.type.Consumer || typeof element.type === 'function')
      ) {
        // Determine the component props.
        const props = { ...element.type.defaultProps, ...element.props }

        if (element.type.Consumer)
          // Context consumer element.
          recurse(element.props.children(element.type.currentValue))
        else if (
          // The element is a class component…
          element.type.prototype &&
          (element.type.prototype.isReactComponent ||
            element.type.prototype.isPureReactComponent)
        ) {
          const instance = new element.type(props)

          // Match React API for default state.
          instance.state = instance.state || null

          // Support setState.
          instance.setState = newState => {
            if (typeof newState === 'function')
              newState = newState(instance.state, instance.props)
            instance.state = { ...instance.state, ...newState }
          }

          // Support for componentWillMount can be removed when it’s deprecated in
          // React: https://github.com/facebook/react/issues/12152
          if (instance.componentWillMount) instance.componentWillMount()

          if (
            // The element is a GraphQL query component and…
            instance.constructor.name === 'GraphQLQuery' &&
            // …It’s to load on mount and…
            element.props.loadOnMount &&
            // …It’s not a root query already loaded…
            (element !== rootElement || loadRoot)
          )
            loading.push(
              // Load this query.
              instance.load().then(() =>
                // Preload children, without reloading this query as the root.
                recursePreload(element, false)
              )
            )
          else recurse(instance.render())
        } else
          // The element is a functional component…
          recurse(element.type(props))
      } else if (
        // The element is a context provider or DOM element and…
        element.props &&
        // …It has children…
        element.props.children
      ) {
        // If the element is a context provider first set the value.
        if (element.type.context)
          element.type.context.currentValue = element.props.value

        recurse(element.props.children)
      }
    }

    recurse(rootElement)

    return Promise.all(loading)
  }

  return recursePreload(element)
}

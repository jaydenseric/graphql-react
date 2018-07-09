/**
 * Recursively preloads [`Query`]{@link Query} components that have the
 * `loadOnMount` prop in a React element tree. Useful for server side rendering
 * (SSR) or to preload components for a better user experience when they mount.
 * @kind function
 * @name preload
 * @param {ReactElement} element A React virtual DOM element.
 * @returns {Promise} Resolves once loading is done and cache is ready to be exported from the [`GraphQL`]{@link GraphQL} instance. Cache can be imported when constructing new [`GraphQL`]{@link GraphQL} instances.
 * @example <caption>An async SSR function that returns a HTML string and cache JSON for client hydration.</caption>
 * ```jsx
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
 * ```
 */
export function preload(element) {
  /**
   * @kind function
   * @name preload~recursePreload
   * @param {ReactElement} rootElement A React virtual DOM element.
   * @param {Object} [rootLegacyContext={}] Legacy React context for the root element and children.
   * @param {boolean} [loadRoot=true] Should the root element be loaded.
   * @returns {Promise} Resolves once loading is done.
   * @ignore
   */
  const recursePreload = (
    rootElement,
    rootLegacyContext = {},
    loadRoot = true
  ) => {
    const loading = []

    /**
     * @kind function
     * @name preload~recursePreload~recurse
     * @param {ReactElement} element A React virtual DOM element.
     * @param {Object} [legacyContext] Legacy React context for the element and children.
     * @ignore
     */
    const recurse = (element, legacyContext) => {
      if (!element) return

      if (Array.isArray(element)) {
        element.forEach(item => recurse(item, legacyContext))
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
          recurse(
            element.props.children(element.type.currentValue),
            legacyContext
          )
        else if (
          // The element is a class component…
          element.type.prototype &&
          (element.type.prototype.isReactComponent ||
            element.type.prototype.isPureReactComponent)
        ) {
          const instance = new element.type(props, legacyContext)

          // Match React API for default state.
          instance.state = instance.state || null

          // Support setState.
          instance.setState = newState => {
            if (typeof newState === 'function')
              newState = newState(instance.state, instance.props)
            instance.state = { ...instance.state, ...newState }
          }

          // Deprecated componentWillMount and legacy context APIs must be
          // supported until removal from React, likely in v17:
          // https://github.com/facebook/react/issues/12152

          // Support componentWillMount.
          if (instance.componentWillMount) instance.componentWillMount()

          // Support legacy context.
          if (instance.getChildContext)
            legacyContext = {
              ...legacyContext,
              ...instance.getChildContext()
            }

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
                recursePreload(element, legacyContext, false)
              )
            )
          else recurse(instance.render(), legacyContext)
        }
        // The element is a functional component…
        else recurse(element.type(props), legacyContext)
      } else if (
        // The element is a context provider or DOM element and…
        element.props &&
        // …It has children…
        element.props.children
      ) {
        // If the element is a context provider first set the value.
        if (element.type._context)
          element.type._context.currentValue = element.props.value

        recurse(element.props.children, legacyContext)
      }
    }

    recurse(rootElement, rootLegacyContext)

    return Promise.all(loading)
  }

  return recursePreload(element)
}

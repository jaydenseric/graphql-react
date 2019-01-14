/**
 * Whether or not the runtime environment supports Symbol.for. Although all
 * supported versions of Node.js (see package engines field) support Symbol,
 * the preload function may be also be used in the browser.
 * @kind constant
 * @name hasSymbol
 * @type {boolean}
 * @see [React source](https://github.com/facebook/react/blob/v16.6.0/packages/shared/ReactSymbols.js#L12).
 * @ignore
 */
const hasSymbol = typeof Symbol === 'function' && Symbol.for

/**
 * Symbol for React context consumer components. The bundle impact is too big to
 * import it the propper way from [`react-is`](https://npm.im/react-is). Also
 * [babel/babel#7998](https://github.com/babel/babel/issues/7998) would cause a
 * CJS runtime error.
 * @kind constant
 * @name REACT_CONTEXT_TYPE
 * @see [React source](https://github.com/facebook/react/blob/v16.6.0/packages/shared/ReactSymbols.js#L32).
 * @ignore
 */
const REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace

/**
 * Recursively preloads [`Query`]{@link Query} components that have the
 * `loadOnMount` prop in a React element tree. Useful for server side rendering
 * (SSR) or to preload components for a better user experience when they mount.
 * @kind function
 * @name preload
 * @param {ReactElement} element A React virtual DOM element.
 * @returns {Promise<void>} Resolves once loading is done and cache is ready to be exported from the [`GraphQL`]{@link GraphQL} instance. Cache can be imported when constructing new [`GraphQL`]{@link GraphQL} instances.
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
export const preload = element =>
  new Promise((resolve, reject) => {
    /**
     * @kind function
     * @name preload~recursePreload
     * @param {ReactElement} rootElement A React virtual DOM element.
     * @param {Object} [rootLegacyContext={}] React legacy context for the root element and children.
     * @param {Object} [rootNewContext={}] React new context map for the root element and children.
     * @param {boolean} [loadRoot=true] Should the root element be loaded.
     * @returns {Promise<void>} Resolves once loading is done.
     * @ignore
     */
    const recursePreload = (
      rootElement,
      rootLegacyContext = {},
      rootNewContext = new Map(),
      loadRoot = true
    ) => {
      const loading = []

      /**
       * @kind function
       * @name preload~recursePreload~recurse
       * @param {ReactElement} element A React virtual DOM element.
       * @param {Object} [legacyContext] React legacy context for the element and children.
       * @param {Map} [newContext] React new context map for the element and children.
       * @ignore
       */
      const recurse = (element, legacyContext, newContext) => {
        if (!element) return

        if (Array.isArray(element)) {
          element.forEach(item => recurse(item, legacyContext, newContext))
          return
        }

        if (
          // The element is not a childless string or number and…
          element.type &&
          // …It’s a context consumer or a functional/class component…
          (element.type.$$typeof === REACT_CONTEXT_TYPE ||
            typeof element.type === 'function')
        ) {
          // Determine the component props.
          const props = { ...element.type.defaultProps, ...element.props }

          if (element.type.$$typeof === REACT_CONTEXT_TYPE) {
            // Context consumer element.

            let value = element.type._currentValue
            const Provider = element.type._context
              ? element.type._context.Provider
              : element.type.Provider

            if (newContext && newContext.has(Provider))
              value = newContext.get(Provider)

            recurse(element.props.children(value), legacyContext, newContext)
          } else if (
            // The element is a class component…
            element.type.prototype &&
            (element.type.prototype.isReactComponent ||
              element.type.prototype.isPureReactComponent)
          ) {
            const instance = new element.type(props, legacyContext)

            // A class component with a constructor should call super(props).
            // This matches React’s fault tolerance, see:
            // https://github.com/facebook/react/blob/v16.7.0/packages/react-dom/src/server/ReactPartialRenderer.js#L532
            instance.props = instance.props || props

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
                  recursePreload(element, legacyContext, newContext, false)
                )
              )
            else recurse(instance.render(), legacyContext, newContext)
          }
          // The element is a functional component…
          else recurse(element.type(props), legacyContext, newContext)
        } else if (
          // The element is a context provider or DOM element and…
          element.props &&
          // …It has children…
          element.props.children
        ) {
          // If the element is a context provider first set the value.
          if (element.type._context) {
            // Clone the context map to scope mutations to this provider’s
            // descendants.
            newContext = new Map(newContext)

            // Set the context, keyed by the provider’s component type.
            newContext.set(element.type, element.props.value)
          }

          recurse(element.props.children, legacyContext, newContext)
        }
      }

      recurse(rootElement, rootLegacyContext, rootNewContext)

      return Promise.all(loading).then(() => {})
    }

    recursePreload(element)
      .then(resolve)
      .catch(reject)
  })

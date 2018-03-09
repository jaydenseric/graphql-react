/**
 * Recurses a React element tree.
 * @ignore
 * @param {ReactElement} element Root React element.
 * @param {RecurseReactElementVisitor} visitor Visitor function.
 */
export function recurseReactElement(element, visitor) {
  if (Array.isArray(element)) {
    element.forEach(item => recurseReactElement(item, visitor))
    return
  }

  if (!element.type)
    // Static string or number element, without children.
    visitor(element)
  else if (
    // Context consumer element or…
    element.type.Consumer ||
    // Functional or class component element…
    typeof element.type === 'function'
  ) {
    const props = {
      ...element.type.defaultProps,
      ...element.props
    }

    let children

    if (element.type.Consumer)
      // Context consumer element.
      children = element.props.children(element.type.currentValue)
    else if (
      element.type.prototype &&
      (element.type.prototype.isReactComponent ||
        element.type.prototype.isPureReactComponent)
    ) {
      // Class component element.

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

      if (visitor(element, instance)) children = instance.render()
    } else if (visitor(element))
      // Functional component element.
      children = element.type(props)

    if (children) recurseReactElement(children, visitor)
  } else if (visitor(element) && element.props && element.props.children) {
    // Context provider or DOM element.

    // If the element is a context provider set the value.
    if (element.type.context)
      element.type.context.currentValue = element.props.value

    recurseReactElement(element.props.children, visitor)
  }
}

/**
 * Preloads all queries that are intended to load on mount in a React component
 * tree; usefull for SSR.
 * @param {ReactElement} rootElement Root React element.
 * @param {GraphQL} graphql {@link GraphQL} instance.
 * @param {Boolean} skipRoot Should the root element be skipped.
 * @returns {Promise<GraphQL#cache>} GraphQL cache.
 */
export function preload(rootElement, graphql, skipRoot) {
  const loading = []
  recurseReactElement(rootElement, (element, instance) => {
    if (
      instance &&
      instance.constructor.name === 'GraphQLQuery' &&
      element.props.loadOnMount &&
      !(skipRoot && element === rootElement)
    ) {
      loading.push(instance.load().then(() => preload(element, graphql, true)))
      return false
    }
    return true
  })
  return Promise.all(loading).then(() => graphql.cache)
}

/**
 * @callback RecurseReactElementVisitor
 * @ignore
 * @param {ReactElement} element React element.
 * @param {Object} [instance] React component class extension instance.
 * @returns {Boolean} Should recursion continue.
 */

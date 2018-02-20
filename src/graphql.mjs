import fnv1a from 'fnv1a'

export class GraphQL {
  constructor({ cache = {}, requestOptions } = {}) {
    this.cache = cache

    if (typeof requestOptions === 'function')
      this.requestOptions = requestOptions
  }

  requests = {}
  listeners = {}

  static hashRequestOptions = requestOptions =>
    fnv1a(JSON.stringify(requestOptions)).toString(36)

  on = (event, callback) => {
    const queue = this.listeners[event] || (this.listeners[event] = [])
    queue.push(callback)
  }

  off = (event, callback) => {
    if (this.listeners[event])
      this.listeners[event] = this.listeners[event].filter(
        listenerCallback => listenerCallback != callback
      )
  }

  emit = (event, ...args) => {
    if (this.listeners[event])
      this.listeners[event].forEach(callback => callback.apply(this, args))
  }

  reset = () => {
    const requestHashes = Object.keys(this.cache)
    this.cache = {}
    requestHashes.forEach(requestHash => this.emit('cacheupdate', requestHash))
  }

  getRequestOptions(operation) {
    // Defaults.
    const options = {
      url: '/graphql',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(operation)
    }

    if (this.requestOptions)
      // Customize defaults.
      this.requestOptions(options, operation)

    return options
  }

  request = ({ url, ...options }, requestHash) => {
    const requestCache = {}
    return (this.requests[requestHash] = fetch(url, options))
      .then(response => {
        if (!response.ok)
          requestCache.httpError = {
            status: response.status,
            statusText: response.statusText
          }

        return response.json()
      })
      .catch(({ message }) => {
        // Failed to parse JSON.
        requestCache.parseError = message
      })
      .then(({ errors, data }) => {
        if (errors) requestCache.graphQLErrors = errors
        if (data) requestCache.data = data

        // Clear the done request.
        delete this.requests[requestHash]

        // Cache the request.
        this.cache[requestHash] = requestCache
        this.emit('cacheupdate', requestHash, requestCache)

        return requestCache
      })
  }

  query = operation => {
    const requestOptions = this.getRequestOptions(operation)
    const requestHash = this.constructor.hashRequestOptions(requestOptions)
    return {
      oldRequestCache: this.cache[requestHash],
      requestHash,
      request:
        // Existing request or
        this.requests[requestHash] ||
        // a fresh request.
        this.request(requestOptions, requestHash)
    }
  }
}

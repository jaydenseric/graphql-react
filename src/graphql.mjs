import fnv1a from 'fnv1a'

export class GraphQL {
  constructor({ cache = {}, requestOptions } = {}) {
    this.cache = cache
    this.requestOptions = requestOptions
  }

  requests = {}
  listeners = {}

  onCacheUpdate = (requestHash, callback) =>
    (this.listeners[requestHash] || (this.listeners[requestHash] = [])).push(
      callback
    )

  offCacheUpdate = (requestHash, callback) => {
    if (this.listeners[requestHash]) {
      this.listeners[requestHash] = this.listeners[requestHash].filter(
        listenerCallback => listenerCallback !== callback
      )
      if (!this.listeners[requestHash].length)
        delete this.listeners[requestHash]
    }
  }

  emitCacheUpdate = (requestHash, requestCache) => {
    if (this.listeners[requestHash])
      this.listeners[requestHash].forEach(callback => callback(requestCache))
  }

  reset = () => {
    const requestHashes = Object.keys(this.cache)
    this.cache = {}
    requestHashes.forEach(requestHash => this.emitCacheUpdate(requestHash))
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

  static hashRequestOptions = requestOptions =>
    fnv1a(JSON.stringify(requestOptions)).toString(36)

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
        // Failed to parse the response as JSON.
        requestCache.parseError = message
      })
      .then(({ errors, data }) => {
        if (errors) requestCache.graphQLErrors = errors
        if (data) requestCache.data = data

        // Clear the done request.
        delete this.requests[requestHash]

        // Cache the request.
        this.cache[requestHash] = requestCache
        this.emitCacheUpdate(requestHash, requestCache)

        return requestCache
      })
  }

  query = operation => {
    const requestOptions = this.getRequestOptions(operation)
    const requestHash = this.constructor.hashRequestOptions(requestOptions)
    return {
      pastRequestCache: this.cache[requestHash],
      requestHash,
      request:
        // Existing request or…
        this.requests[requestHash] ||
        // …a fresh request.
        this.request(requestOptions, requestHash)
    }
  }
}

import fnv1a from 'fnv1a'

export class GraphQL {
  constructor({ requestOptions } = {}) {
    if (typeof requestOptions === 'function')
      this.requestOptions = requestOptions
  }

  cache = {}
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
    requestHashes.forEach(requestHash =>
      this.emit('cacheupdate', { requestHash })
    )
  }

  import = json => {
    this.cache = JSON.parse(json)
  }

  export = () => JSON.stringify(this.cache)

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

  request = async ({ url, ...options }, requestHash) => {
    // Send the request.
    this.requests[requestHash] = fetch(url, options)

    // Make the request.
    const response = await this.requests[requestHash]
    const cache = {}

    if (!response.ok)
      cache.httpError = {
        status: response.status,
        statusText: response.statusText
      }

    try {
      const { data, errors } = await response.json()
      if (data) cache.data = data
      if (errors) cache.graphQLErrors = errors
    } catch (error) {
      cache.parseError = error.message
    }

    // Clear the done request.
    delete this.requests[requestHash]

    // Cache the request.
    this.cache[requestHash] = cache
    this.emit('cacheupdate', { requestHash, cache })

    return cache
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

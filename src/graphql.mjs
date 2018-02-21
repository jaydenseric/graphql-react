import fnv1a from 'fnv1a'
import extractFiles from 'extract-files'

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
    const options = {
      url: '/graphql',
      method: 'POST',
      headers: { accept: 'application/json' }
    }

    const files = extractFiles(operation)

    if (files.length) {
      // GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec
      options.body = new FormData()
      options.body.append('operations', JSON.stringify(operation))
      options.body.append(
        'map',
        JSON.stringify(
          files.reduce((map, { path }, index) => {
            map[`${index}`] = [path]
            return map
          }, {})
        )
      )
      files.forEach(({ file }, index) =>
        options.body.append(index, file, file.name)
      )
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(operation)
    }

    if (this.requestOptions)
      // Customize request options.
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
      .then(
        // JSON parse ok.
        ({ errors, data }) => {
          if (!errors && !data) requestCache.parseError = 'Malformed payload.'
          if (errors) requestCache.graphQLErrors = errors
          if (data) requestCache.data = data
        },
        // JSON parse error.
        ({ message }) => {
          requestCache.parseError = message
        }
      )
      .then(() => {
        // Cache the request.
        this.cache[requestHash] = requestCache
        this.emitCacheUpdate(requestHash, requestCache)

        // Clear the done request.
        delete this.requests[requestHash]

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

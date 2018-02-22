import fnv1a from 'fnv1a'
import extractFiles from 'extract-files'

/**
 * A lightweight GraphQL client with a request cache.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.cache={}] Cache to import; useful once a SSR API is available.
 * @param {RequestOptionsOverride} [options.requestOptions] A function that accepts and modifies generated options for every request.
 * @example
 * const graphql = new GraphQL({
 *   requestOptions: options => {
 *     options.url = 'https://api.example.com/graphql'
 *     options.credentials = 'include'
 *   }
 * })
 */
export class GraphQL {
  constructor({ cache = {}, requestOptions } = {}) {
    this.cache = cache
    this.requestOptions = requestOptions
  }

  requests = {}
  listeners = {}

  /**
   * Adds a cache update listener for a request.
   * @private
   * @param {String} requestHash Request options hash.
   * @param {CacheUpdateCallback} callback Callback.
   */
  onCacheUpdate = (requestHash, callback) => {
    if (!this.listeners[requestHash]) this.listeners[requestHash] = []
    this.listeners[requestHash].push(callback)
  }

  /**
   * Removes a cache update listener for a request.
   * @private
   * @param {String} requestHash Request options hash.
   * @param {CacheUpdateCallback} callback Callback.
   */
  offCacheUpdate = (requestHash, callback) => {
    if (this.listeners[requestHash]) {
      this.listeners[requestHash] = this.listeners[requestHash].filter(
        listenerCallback => listenerCallback !== callback
      )
      if (!this.listeners[requestHash].length)
        delete this.listeners[requestHash]
    }
  }

  /**
   * Triggers cache update listeners for a request.
   * @private
   * @param {String} requestHash Request options hash.
   * @param {RequestCache} requestCache Request cache.
   */
  emitCacheUpdate = (requestHash, requestCache) => {
    if (this.listeners[requestHash])
      this.listeners[requestHash].forEach(callback => callback(requestCache))
  }

  /**
   * Resets the cache. Useful when a user logs out.
   * @example
   * graphql.reset()
   */
  reset = () => {
    const requestHashes = Object.keys(this.cache)
    this.cache = {}
    requestHashes.forEach(requestHash => this.emitCacheUpdate(requestHash))
  }

  /**
   * Derives a fetch request body from a GraphQL operation, accounting for
   * file uploads. Files are extracted from the operation, modifying the
   * operation object. See the {@link https://github.com/jaydenseric/graphql-multipart-request-spec GraphQL multipart request spec}.
   * @private
   * @param {Operation} operation GraphQL operation.
   * @returns {String|FormData} A JSON string, or for uploads a multipart form.
   */
  static getRequestBody(operation) {
    const files = extractFiles(operation)
    if (files.length) {
      const form = new FormData()
      form.append('operations', JSON.stringify(operation))
      form.append(
        'map',
        JSON.stringify(
          files.reduce((map, { path }, index) => {
            map[`${index}`] = [path]
            return map
          }, {})
        )
      )
      files.forEach(({ file }, index) => form.append(index, file, file.name))
      return form
    } else return JSON.stringify(operation)
  }

  /**
   * Gets request options for a GraphQL operation.
   * @private
   * @param {Operation} operation GraphQL operation.
   * @returns {RequestOptions} Request options.
   */
  getRequestOptions(operation) {
    const requestOptions = {
      url: '/graphql',
      method: 'POST',
      headers: { accept: 'application/json' }
    }

    requestOptions.body = this.constructor.getRequestBody(operation)

    // Body may be a JSON string or a FormData instance.
    if (typeof requestOptions.body === 'string')
      requestOptions.headers['Content-Type'] = 'application/json'

    if (
      // A function to override request options has been configured…
      this.requestOptions
    )
      // Override request options.
      this.requestOptions(requestOptions, operation)

    return requestOptions
  }

  /**
   * Hashes a request options object.
   * @private
   * @param {RequestOptions} requestOptions Request options.
   * @returns {String} A hash.
   */
  static hashRequestOptions = requestOptions =>
    fnv1a(JSON.stringify(requestOptions)).toString(36)

  /**
   * Executes a fetch request.
   * @private
   * @param {RequestOptions} requestOptions URL and options for fetch.
   * @param {String} requestHash Request options hash.
   * @returns {RequestCachePromise} Promise that resolves the request cache.
   */
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
        ({ errors, data }) => {
          // JSON parse ok.
          if (!errors && !data) requestCache.parseError = 'Malformed payload.'
          if (errors) requestCache.graphQLErrors = errors
          if (data) requestCache.data = data
        },
        ({ message }) => {
          // JSON parse error.
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

  /**
   * Queries a GraphQL server.
   * @param {Operation} operation GraphQL operation object.
   * @returns {ActiveQuery} In-flight query details.
   */
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

/**
 * A GraphQL operation object. Additional properties may be used; all are sent
 * to the GraphQL server.
 * @typedef {Object} Operation
 * @prop {String} query GraphQL queries or mutations.
 * @prop {Object} variables Variables used by the query.
 */

/**
 * Options for a GraphQL fetch request. See {@link https://github.github.io/fetch/#options polyfillable fetch options}.
 * @typedef {Object} RequestOptions
 * @prop {String} url A GraphQL API URL.
 * @prop {String|FormData} body HTTP request body.
 * @prop {Object} headers HTTP request headers.
 * @prop {String} [credentials] Authentication credentials mode.
 */

/**
 * A way to override request options generated for a fetch. Modify the provided
 * options object directly; no return.
 * @typedef {Function} RequestOptionsOverride
 * @param {RequestOptions} requestOptions
 * @example
 * options => {
 *   options.url = 'https://api.example.com/graphql'
 *   options.credentials = 'include'
 * }
 */

/**
 * @typedef {Object} ActiveQuery
 * @prop {RequestCache} [pastRequestCache] Results from the last identical request.
 * @prop {String} requestHash Request options hash.
 * @prop {RequestCachePromise} request Promise that resolves fresh request cache.
 */

/**
 * A promise for an in-flight query that resolves the request cache.
 * @typedef {Promise<RequestCache>} RequestCachePromise
 */

/**
 * JSON serializable result of a request (including all errors and data) for
 * caching purposes.
 * @typedef {Object} RequestCache
 * @prop {Object} httpError HTTP error.
 * @prop {String} httpError.status HTTP status code.
 * @prop {String} httpError.statusText HTTP status text.
 * @prop {String} parseError Parse error message.
 * @prop {Object} graphQLErrors GraphQL response errors.
 * @prop {Object} data GraphQL response data.
 */

/**
 * A cache update listener callback.
 * @callback CacheUpdateCallback
 * @param {RequestCache} requestCache Request cache.
 */

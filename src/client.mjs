import fnv1a from 'fnv1a'

const objectHash = object => fnv1a(JSON.stringify(object)).toString(36)

export class Client {
  constructor({ requestOptions } = {}) {
    if (typeof requestOptions === 'function')
      this.requestOptions = requestOptions
  }

  cache = {}
  requests = {}

  clearCache = () => {
    this.cache = {}
  }

  importCache = json => {
    this.cache = JSON.parse(json)
  }

  exportCache = () => JSON.stringify(this.cache)

  getRequestOptions(operation) {
    // Defaults
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
      // Customize defaults
      this.requestOptions(options, operation)

    return options
  }

  request = async ({ url, ...options }, hash) => {
    // Send the request
    this.requests[hash] = fetch(url, options)

    // Get the result
    const result = {}
    const response = await this.requests[hash]

    if (!response.ok)
      result.httpError = {
        status: response.status,
        statusText: response.statusText
      }

    try {
      const { data, errors } = await response.json()
      if (data) result.data = data
      if (errors) result.graphQLErrors = errors
    } catch (error) {
      result.parseError = error.message
    }

    // Clear the done request
    delete this.requests[hash]

    // Cache the result
    this.cache[hash] = result

    return result
  }

  query = operation => {
    const options = this.getRequestOptions(operation)
    const hash = objectHash(options)
    return {
      cache: this.cache[hash],
      request:
        // Existing request
        this.requests[hash] ||
        // Fresh request
        this.request(options, hash)
    }
  }
}

import fnv1a from 'fnv1a'

const objectHash = object => fnv1a(JSON.stringify(object)).toString(36)

export class Skimp {
  constructor({ request } = {}) {
    if (typeof request === 'function') this.request = request
  }

  cache = {}

  clearCache = () => {
    this.cache = {}
  }

  exportCache = () =>
    JSON.stringify(
      this.cache,
      (key, value) => (key === 'request' ? undefined : value)
    )

  importCache = json => {
    this.cache = JSON.parse(json)
  }

  query = async operation => {
    // Default request options
    const requestOptions = {
      url: '/graphql',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(operation)
    }

    // Customize request options
    if (this.request) this.request(requestOptions, operation)

    // Prepare query cache
    const requestOptionsHash = objectHash(requestOptions)
    this.cache[requestOptionsHash] = {}

    // Make the request
    const { url, ...fetchOptions } = requestOptions
    this.cache[requestOptionsHash].request = fetch(url, fetchOptions)

    const response = await this.cache[requestOptionsHash].request

    if (!response.ok)
      this.cache[requestOptionsHash].httpError = {
        status: response.status,
        statusText: response.statusText
      }

    try {
      const { data, errors } = await response.json()
      if (data) this.cache[requestOptionsHash].data = data
      if (errors) this.cache[requestOptionsHash].graphQLErrors = errors
    } catch (error) {
      this.cache[requestOptionsHash].parseError = error.message
    }

    // Return the cached query result
    return this.cache[requestOptionsHash]
  }
}

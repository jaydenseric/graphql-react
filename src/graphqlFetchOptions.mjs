import { extractFiles } from 'extract-files'

/**
 * Gets default [fetch options]{@link FetchOptions} for a GraphQL operation.
 * @kind function
 * @name graphqlFetchOptions
 * @param {GraphQLOperation} operation GraphQL operation.
 * @returns {FetchOptions} Fetch options.
 * @ignore
 */
export function graphqlFetchOptions(operation) {
  const fetchOptions = {
    url: '/graphql',
    method: 'POST',
    headers: { Accept: 'application/json' }
  }

  const { clone, files } = extractFiles(operation)
  const operationJSON = JSON.stringify(clone)

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData()

    form.append('operations', operationJSON)

    const map = {}
    let i = 0
    files.forEach(paths => {
      map[++i] = paths
    })
    form.append('map', JSON.stringify(map))

    i = 0
    files.forEach((paths, file) => {
      form.append(++i, file, file.name)
    })

    fetchOptions.body = form
  } else {
    fetchOptions.headers['Content-Type'] = 'application/json'
    fetchOptions.body = operationJSON
  }

  return fetchOptions
}

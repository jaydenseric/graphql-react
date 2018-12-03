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

  // Files are extracted from the operation, modifying the operation object.
  const files = extractFiles(operation)

  // Done after files are extracted.
  const operationJSON = JSON.stringify(operation)

  if (files.length) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec
    const form = new FormData()
    form.append('operations', operationJSON)
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
    fetchOptions.body = form
  } else {
    fetchOptions.headers['Content-Type'] = 'application/json'
    fetchOptions.body = operationJSON
  }

  return fetchOptions
}

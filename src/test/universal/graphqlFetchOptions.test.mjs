import { deepStrictEqual, strictEqual } from 'assert'
import Blob from 'fetch-blob'
import FormData from 'formdata-node'
import { graphqlFetchOptions } from '../../universal/graphqlFetchOptions.mjs'

// Global polyfills.
global.Blob = Blob
global.FormData = FormData

export default tests => {
  tests.add('`graphqlFetchOptions` without files', () => {
    deepStrictEqual(graphqlFetchOptions({ query: '' }), {
      url: '/graphql',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: '{"query":""}'
    })
  })

  tests.add('`graphqlFetchOptions` with files', () => {
    const filetype = 'text/plain'
    const options = graphqlFetchOptions({
      query: '',
      variables: { a: new Blob(['a'], { type: filetype }) }
    })

    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    strictEqual(options.url, '/graphql')
    strictEqual(options.method, 'POST')
    deepStrictEqual(options.headers, { Accept: 'application/json' })
    strictEqual(options.body instanceof FormData, true)

    const formDataEntries = Array.from(options.body.entries())

    strictEqual(formDataEntries.length, 3)
    deepStrictEqual(formDataEntries[0], [
      'operations',
      '{"query":"","variables":{"a":null}}'
    ])
    deepStrictEqual(formDataEntries[1], ['map', '{"1":["variables.a"]}'])
    strictEqual(formDataEntries[2][0], '1')
    strictEqual(typeof formDataEntries[2][1], 'object')

    // Sadly `instanceof Blob` won’t work, see:
    // https://github.com/octet-stream/form-data/issues/14
    strictEqual(formDataEntries[2][1].constructor.name, 'File')

    strictEqual(formDataEntries[2][1].name, 'blob')
    strictEqual(formDataEntries[2][1].type, filetype)
  })
}

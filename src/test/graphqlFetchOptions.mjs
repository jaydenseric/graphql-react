import Blob from 'fetch-blob'
import FormData from 'formdata-node'
import t from 'tap'
import { graphqlFetchOptions } from '../universal/graphqlFetchOptions.mjs'

// Global polyfills.
global.Blob = Blob
global.FormData = FormData

t.test('graphqlFetchOptions', async t => {
  await t.test('Without files', t => {
    t.deepEquals(
      graphqlFetchOptions({ query: '' }),
      {
        url: '/graphql',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: '{"query":""}'
      },
      'Fetch options'
    )
    t.end()
  })

  await t.test('With files', t => {
    const filetype = 'text/plain'
    const options = graphqlFetchOptions({
      query: '',
      variables: { a: new Blob(['a'], { type: filetype }) }
    })

    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    t.equals(options.url, '/graphql')
    t.equals(options.method, 'POST')
    t.deepEquals(options.headers, {
      Accept: 'application/json'
    })
    t.type(options.body, FormData, 'Fetch options `body` type')

    const formDataEntries = Array.from(options.body.entries())

    t.equals(formDataEntries.length, 3)
    t.deepEquals(formDataEntries[0], [
      'operations',
      '{"query":"","variables":{"a":null}}'
    ])
    t.deepEquals(formDataEntries[1], ['map', '{"1":["variables.a"]}'])

    t.equals(formDataEntries[2][0], '1')
    t.equals(typeof formDataEntries[2][1], 'object')

    // Sadly `instanceof Blob` won’t work, see:
    // https://github.com/octet-stream/form-data/issues/14
    t.equals(formDataEntries[2][1].constructor.name, 'File')

    t.equals(formDataEntries[2][1].name, 'blob')
    t.equals(formDataEntries[2][1].type, filetype)
    t.end()
  })
})

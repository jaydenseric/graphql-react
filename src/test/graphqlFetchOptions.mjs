import { ReactNativeFile } from 'extract-files'
import FormData from 'formdata-node'
import t from 'tap'
import { graphqlFetchOptions } from '../universal/graphqlFetchOptions.mjs'

// Global FormData polyfill.
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
    const file = new ReactNativeFile({
      uri: '',
      name: 'a.jpg',
      type: 'image/jpeg'
    })
    const options = graphqlFetchOptions({
      query: '',
      variables: { a: file }
    })

    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    t.type(options.body, FormData, 'Fetch options `body` type')
    t.deepEquals(
      options,
      {
        url: '/graphql',
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: [
          ['operations', '{"query":"","variables":{"a":null}}'],
          ['map', '{"1":["variables.a"]}'],
          ['1', '[object Object]']
        ]
      },
      'Fetch options'
    )
    t.end()
  })
})

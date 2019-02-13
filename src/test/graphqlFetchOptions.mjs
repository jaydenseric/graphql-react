import t from 'tap'
import { graphqlFetchOptions } from '../universal/graphqlFetchOptions'

t.test('graphqlFetchOptions', t => {
  const fetchOptions = graphqlFetchOptions({ query: '' })
  t.deepEquals(fetchOptions, {
    body: '{"query":""}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    url: '/graphql'
  })
  t.end()
})

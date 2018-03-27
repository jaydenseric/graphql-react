import { Query } from 'graphql-react'
import { timeFetchOptionsOverride } from '../api-fetch-options'
import Loader from './loader'
import FetchError from './fetch-error'
import HTTPError from './http-error'
import ParseError from './parse-error'
import GraphQLErrors from './graphql-errors'

const ExampleGraphQLError = () => (
  <Query
    loadOnMount
    loadOnReset
    fetchOptionsOverride={timeFetchOptionsOverride}
    query={
      /* GraphQL */ `
        {
          exampleError
        }
      `
    }
  >
    {({ loading, fetchError, httpError, parseError, graphQLErrors }) => (
      <article>
        {loading && <Loader />}
        {fetchError && <FetchError error={fetchError} />}
        {httpError && <HTTPError error={httpError} />}
        {parseError && <ParseError error={parseError} />}
        {graphQLErrors && <GraphQLErrors errors={graphQLErrors} />}
      </article>
    )}
  </Query>
)

export default ExampleGraphQLError

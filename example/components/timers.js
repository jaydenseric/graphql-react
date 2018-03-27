import { Query } from 'graphql-react'
import Loader from './loader'
import FetchError from './fetch-error'
import HTTPError from './http-error'
import ParseError from './parse-error'
import GraphQLErrors from './graphql-errors'
import { timeFetchOptionsOverride } from '../api-fetch-options'

const Timer = ({ id, milliseconds }) => (
  <Query
    fetchOptionsOverride={timeFetchOptionsOverride}
    variables={{ id }}
    query={
      /* GraphQL */ `
      query timer($id: ID!) {
        timer(timerId: $id) {
          id
          milliseconds
        }
      }
    `
    }
  >
    {({
      load,
      loading,
      fetchError,
      httpError,
      parseError,
      graphQLErrors,
      data
    }) => (
      <tr>
        <td>
          <button disabled={loading} onClick={load}>
            Load
          </button>
          {(fetchError || httpError || parseError || graphQLErrors) && (
            <strong>Error!</strong>
          )}
        </td>
        <td>{id}</td>
        <td>{data ? data.timer.milliseconds : milliseconds}</td>
      </tr>
    )}
  </Query>
)

const Timers = () => (
  <Query
    loadOnMount
    loadOnReset
    fetchOptionsOverride={timeFetchOptionsOverride}
    query={
      /* GraphQL */ `
      {
        timers {
          id
          milliseconds
        }
      }
    `
    }
  >
    {({ loading, fetchError, httpError, parseError, graphQLErrors, data }) => (
      <section>
        {data &&
          (data.timers.length ? (
            <table>
              <thead>
                <tr>
                  <th>Load</th>
                  <th>Id</th>
                  <th>Milliseconds</th>
                </tr>
              </thead>
              <tbody>
                {data.timers.map(timer => <Timer key={timer.id} {...timer} />)}
              </tbody>
            </table>
          ) : (
            <p>Create a first timer.</p>
          ))}
        {loading && <Loader />}
        {fetchError && <FetchError error={fetchError} />}
        {httpError && <HTTPError error={httpError} />}
        {parseError && <ParseError error={parseError} />}
        {graphQLErrors && <GraphQLErrors errors={graphQLErrors} />}
      </section>
    )}
  </Query>
)

export default Timers

import { GraphQL } from '../../lib'
import Loader from './loader'
import HTTPError from './http-error'
import GraphQLErrors from './graphql-errors'

const Timer = ({ id, milliseconds }) => (
  <GraphQL
    autoload={false}
    variables={{ id }}
    query={`
      query timer($id: ID!) {
        timer(timerId: $id) {
          id
          milliseconds
        }
      }
    `}
  >
    {({ load, loading, httpError, graphQLErrors, data }) => (
      <tr>
        <td>{id}</td>
        <td>{data ? data.timer.milliseconds : milliseconds}</td>
        <td>
          {loading ? <Loader /> : <button onClick={load}>Refresh</button>}
          {(httpError || graphQLErrors) && <strong>Error!</strong>}
        </td>
      </tr>
    )}
  </GraphQL>
)

const Timers = () => (
  <GraphQL
    query={`
      {
        timers {
          id
          milliseconds
        }
      }
    `}
  >
    {({ loading, httpError, graphQLErrors, data }) => (
      <section>
        {loading && <Loader />}
        {httpError && <HTTPError error={httpError} />}
        {graphQLErrors && <GraphQLErrors errors={graphQLErrors} />}
        {data &&
          !!data.timers.length && (
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Milliseconds</th>
                  <th>Load</th>
                </tr>
              </thead>
              <tbody>
                {data.timers.map(timer => <Timer key={timer.id} {...timer} />)}
              </tbody>
            </table>
          )}
      </section>
    )}
  </GraphQL>
)

export default Timers

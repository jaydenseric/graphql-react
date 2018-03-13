import { Fragment } from 'react'
import { Query } from 'graphql-react'
import Loader from './loader'
import HTTPError from './http-error'
import ParseError from './parse-error'
import GraphQLErrors from './graphql-errors'
import { pokemonFetchOptionsOverride } from '../api-fetch-options'

const Pokemon = ({ name }) => (
  <Query
    loadOnMount
    loadOnReset
    variables={{ name }}
    fetchOptionsOverride={pokemonFetchOptionsOverride}
    query={
      /* GraphQL */ `
      query pokemon($name: String!) {
        pokemon(name: $name) {
          number
          classification
          image
        }
      }
    `
    }
  >
    {({ loading, httpError, parseError, graphQLErrors, data }) => (
      <article>
        <h1>{name}</h1>
        {data && (
          <Fragment>
            <img src={data.pokemon.image} width="100" alt={name} />
            <table>
              <tbody>
                <tr>
                  <th>Number</th>
                  <td>{data.pokemon.number}</td>
                </tr>
                <tr>
                  <th>Classification</th>
                  <td>{data.pokemon.classification}</td>
                </tr>
              </tbody>
            </table>
          </Fragment>
        )}
        {loading && <Loader />}
        {httpError && <HTTPError error={httpError} />}
        {parseError && <ParseError error={parseError} />}
        {graphQLErrors && <GraphQLErrors errors={graphQLErrors} />}
      </article>
    )}
  </Query>
)

export default Pokemon

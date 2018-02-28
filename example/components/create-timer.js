import { Query } from 'graphql-react'
import Loader from './loader'

const CreateTimer = () => (
  <Query
    resetOnLoad
    query={
      /* GraphQL */ `
      mutation createTimer {
        createTimer {
          id
        }
      }
    `
    }
  >
    {({ loading, data, load }) => (
      <section>
        {data && <p>Timer ID “{data.createTimer.id}” created.</p>}
        {loading ? <Loader /> : <button onClick={load}>Create timer</button>}
      </section>
    )}
  </Query>
)

export default CreateTimer

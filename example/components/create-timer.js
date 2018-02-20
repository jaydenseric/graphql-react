import { GraphQLMutation } from '../../lib'
import Loader from './loader'

const CreateTimer = () => (
  <GraphQLMutation
    query={`
      mutation createTimer {
        createTimer {
          id
        }
      }
    `}
  >
    {({ loading, data, load }) => (
      <section>
        {data && <p>Timer ID “{data.createTimer.id}” created.</p>}
        {loading ? <Loader /> : <button onClick={load}>Create timer</button>}
      </section>
    )}
  </GraphQLMutation>
)

export default CreateTimer

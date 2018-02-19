import { GraphQL } from '../../lib'
import Loader from './loader'

const CreateTimer = () => (
  <GraphQL
    autoload={false}
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
        {data && <p>Timer {data.createTimer.id} created.</p>}
        {loading ? <Loader /> : <button onClick={load}>Create timer</button>}
      </section>
    )}
  </GraphQL>
)

export default CreateTimer

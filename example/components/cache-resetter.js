import { GraphQLClientConsumer } from '../../lib'

const CacheResetter = () => (
  <GraphQLClientConsumer>
    {client => <button onClick={client.reset}>Reset cache</button>}
  </GraphQLClientConsumer>
)

export default CacheResetter

import { GraphQLConsumer } from 'graphql-react'

const CacheResetter = () => (
  <GraphQLConsumer>
    {graphql => <button onClick={graphql.reset}>Reset cache</button>}
  </GraphQLConsumer>
)

export default CacheResetter

import { Consumer } from 'graphql-react'

const CacheResetter = () => (
  <Consumer>
    {graphql => <button onClick={graphql.reset}>Reset cache</button>}
  </Consumer>
)

export default CacheResetter

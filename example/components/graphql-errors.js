const GraphQLErrors = ({ errors }) => (
  <aside>
    <h1>GraphQL errors</h1>
    <ul>
      {errors.map(({ message }, index) => <li key={index}>{message}</li>)}
    </ul>
  </aside>
)

export default GraphQLErrors

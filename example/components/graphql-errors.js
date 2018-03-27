import ErrorMessage from './error-message'

const GraphQLErrors = ({ errors }) => (
  <ErrorMessage heading="GraphQL errors">
    <ul>
      {errors.map(({ message }, index) => <li key={index}>{message}</li>)}
    </ul>
  </ErrorMessage>
)

export default GraphQLErrors

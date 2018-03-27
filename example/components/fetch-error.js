import ErrorMessage from './error-message'

const FetchError = ({ error }) => (
  <ErrorMessage heading="Fetch error">
    <p>{error}</p>
  </ErrorMessage>
)

export default FetchError

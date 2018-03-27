import ErrorMessage from './error-message'

const HTTPError = ({ error: { status, statusText } }) => (
  <ErrorMessage heading={`HTTP error: ${status}`}>
    <p>{statusText}</p>
  </ErrorMessage>
)

export default HTTPError

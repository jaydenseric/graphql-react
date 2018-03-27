import ErrorMessage from './error-message'

const ParseError = ({ error }) => (
  <ErrorMessage heading="Parse error">
    <p>{error}</p>
  </ErrorMessage>
)

export default ParseError
